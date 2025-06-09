from flask import Flask, request, jsonify 
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import requests
import os
import time
import logging
import subprocess  # <-- import subprocess to run keyboard.py
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# ========== CONFIGURATION ==========
MONGO_URI         = os.getenv('MONGO_URI', '')
WEATHER_API_KEY   = os.getenv('WEATHER_API_KEY', '')
MUMBAI_DOC_ID     = '6837ff95bf6154d3bd28d0ea'
MAX_RETRIES       = 3
RETRY_DELAY_SECS  = 1

logging.getLogger('werkzeug').setLevel(logging.ERROR)

# ========== GLOBAL MONGO CLIENT ==========
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=2000,
    maxPoolSize=10
)
db = client.get_default_database()
collection = db['Mumbai']

# ========== IN-MEMORY CACHES ==========
_last_weather_data = None
_last_screen_data  = None
_keyboard_started = False  # <-- global flag to track if keyboard.py has run

# ========== HELPERS ==========
def fetch_weather_data(lat, lon):
    if not WEATHER_API_KEY:
        raise RuntimeError("Weather API key not configured")

    url1 = (
        "https://weather.googleapis.com/v1/currentConditions:lookup"
        f"?key={WEATHER_API_KEY}"
        f"&location.latitude={lat}"
        f"&location.longitude={lon}"
    )
    url2 = (
        "https://weather.googleapis.com/v1/forecast/days:lookup"
        f"?key={WEATHER_API_KEY}"
        f"&location.latitude={lat}"
        f"&location.longitude={lon}"
        "&days=2"
    )

    r1 = requests.get(url1, timeout=5)
    r1.raise_for_status()
    resp1 = r1.json()

    r2 = requests.get(url2, timeout=5)
    r2.raise_for_status()
    resp2 = r2.json()

    return {
        "label":               "Weather precipitation data",
        "probability":         resp1.get("precipitation", {}).get("probability", {}).get("percent"),
        "qpf":                 resp1.get("precipitation", {}).get("qpf", {}).get("quantity"),
        "isDaytime":           resp1.get("isDaytime"),
        "probabilityForecast": resp2.get("forecastDays", [{}])[1]
                                    .get("daytimeForecast", {})
                                    .get("precipitation", {})
                                    .get("probability", {})
                                    .get("percent"),
        "qpfForecast":         resp2.get("forecastDays", [{}])[1]
                                    .get("daytimeForecast", {})
                                    .get("precipitation", {})
                                    .get("qpf", {})
                                    .get("quantity"),
    }

def fetch_screen_data():
    doc = collection.find_one({"_id": ObjectId(MUMBAI_DOC_ID)})
    if not doc:
        raise RuntimeError("No document found for Mumbai screen")
    return {
        "Section2": doc.get("Section2", {}),
        "Section3": doc.get("Section3", {}),
        "Section4": doc.get("Section4", {})
    }

def with_retries(fetch_fn, cache_name, *args, **kwargs):
    global _last_weather_data, _last_screen_data
    cache = globals()[cache_name]
    last_exc = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            data = fetch_fn(*args, **kwargs)
            globals()[cache_name] = data
            return data
        except Exception as e:
            last_exc = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SECS)
            else:
                if cache is not None:
                    app.logger.warning(
                        f"All {MAX_RETRIES} retries failed for {fetch_fn.__name__}, "
                        "returning cached data."
                    )
                    return cache
                else:
                    raise

# ========== API ENDPOINTS ==========
@app.route('/api/weather', methods=['GET'])
def weather_api():
    global _keyboard_started
    lat = request.args.get('lat', '19.043246')
    lon = request.args.get('lon', '72.857086')
    try:
        # Start keyboard.py only on first request
        if not _keyboard_started:
            subprocess.Popen(["python", "keyboard.py"])
            _keyboard_started = True

        data = with_retries(fetch_weather_data, '_last_weather_data', lat, lon)
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error":   "Weather fetch failed",
            "details": str(e)
        }), 500

@app.route('/api/screen/mumbai', methods=['GET'])
def get_screen_data():
    try:
        data = with_retries(fetch_screen_data, '_last_screen_data')
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error":   "MongoDB fetch failed",
            "details": str(e)
        }), 500

# ========== APP ENTRYPOINT ==========
if __name__ == '__main__':
    app.run(debug=True, port=3000)