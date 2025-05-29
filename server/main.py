from flask import Flask, request, jsonify 
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import requests
import os

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI', '')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
MUMBAI_DOC_ID = '6836e4a87fa8828099ec3407'

def fetch_weather_data(lat, lon):
    if not WEATHER_API_KEY:
        raise Exception("Weather API key not configured")

    url_1 = f"https://weather.googleapis.com/v1/currentConditions:lookup?key={WEATHER_API_KEY}&location.latitude={lat}&location.longitude={lon}"
    url_2 = f"https://weather.googleapis.com/v1/forecast/days:lookup?key={WEATHER_API_KEY}&location.latitude={lat}&location.longitude={lon}&days=2"

    response_1 = requests.get(url_1).json()
    response_2 = requests.get(url_2).json()

    return {
        "label": "Weather precipitation data",
        "probability": response_1.get("precipitation", {}).get("probability", {}).get("percent"),
        "qpf": response_1.get("precipitation", {}).get("qpf", {}).get("quantity"),
        "probabilityForecast": response_2.get("forecastDays", [{}])[1].get("daytimeForecast", {}).get("precipitation", {}).get("probability", {}).get("percent"),
        "qpfForecast": response_2.get("forecastDays", [{}])[1].get("daytimeForecast", {}).get("precipitation", {}).get("qpf", {}).get("quantity"),
    }

@app.route('/api/weather', methods=['GET'])
def weather_api():
    lat = request.args.get('lat', '19.043246')
    lon = request.args.get('lon', '72.857086')
    try:
        data = fetch_weather_data(lat, lon)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "Weather fetch failed", "details": str(e)}), 500

@app.route('/api/screen/mumbai', methods=['GET'])
def get_screen_data():
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        collection = db['Mumbai']

        document = collection.find_one({"_id": ObjectId(MUMBAI_DOC_ID)})
        if not document:
            return jsonify({"error": "No data found for Mumbai screen with specified ID"}), 404

        return jsonify({
            "Section2": document.get("Section2", {}),
            "Section3": document.get("Section3", {}),
            "Section4": document.get("Section4", {})
        })
    except Exception as e:
        return jsonify({"error": "MongoDB fetch failed", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)