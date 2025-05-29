from flask import Flask, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timezone
import dateutil.parser  # for parsing ISO timestamps

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

API_KEY = "AIzaSyCBe0cnqJ8G2EgoLTe7tihFcfu3BApA488"

LOCATIONS = {
    "Mumbai": {"lat": 19.0688, "lon": 72.8703},
    "Kochi": {"lat": 9.9312, "lon": 76.2673},
}


def fetch_hourly_forecast(lat, lon, api_key, hours=48):
    url = (
        "https://weather.googleapis.com/v1/forecast/hours:lookup"
        f"?key={api_key}"
        f"&location.latitude={lat}&location.longitude={lon}"
        f"&hours={hours}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json().get("forecastHours", [])


def interpolate(value1, value2, fraction):
    return value1 + (value2 - value1) * fraction


@app.route('/api/rainfall', methods=['GET'])
def get_rainfall():
    try:
        now_utc = datetime.utcnow().replace(tzinfo=timezone.utc)

        results = {}
        for city, coords in LOCATIONS.items():
            hours_data = fetch_hourly_forecast(coords["lat"], coords["lon"], API_KEY, hours=48)
            if not hours_data:
                results[city] = {"message": "No forecast data available"}
                continue

            # Parse times and sort by time
            hours_with_dt = []
            for hour in hours_data:
                start_time_str = hour["interval"]["startTime"]
                start_time = dateutil.parser.isoparse(start_time_str)
                hours_with_dt.append((start_time, hour))
            hours_with_dt.sort(key=lambda x: x[0])

            # Find two closest points around now_utc
            prev_point = None
            next_point = None
            for i, (dt, data) in enumerate(hours_with_dt):
                if dt >= now_utc:
                    next_point = (dt, data)
                    prev_point = hours_with_dt[i - 1] if i > 0 else None
                    break
            else:
                # All points are before now_utc, take last two points if possible
                prev_point = hours_with_dt[-2] if len(hours_with_dt) >= 2 else None
                next_point = hours_with_dt[-1]

            if prev_point and next_point:
                prev_time, prev_data = prev_point
                next_time, next_data = next_point
                total_seconds = (next_time - prev_time).total_seconds()
                if total_seconds == 0:
                    fraction = 0
                else:
                    fraction = (now_utc - prev_time).total_seconds() / total_seconds

                # Extract values or fallback 0
                prev_qpf = prev_data.get("precipitation", {}).get("qpf", {}).get("quantity", 0.0)
                next_qpf = next_data.get("precipitation", {}).get("qpf", {}).get("quantity", 0.0)
                interp_qpf = interpolate(prev_qpf, next_qpf, fraction)

                prev_prob = prev_data.get("precipitation", {}).get("probability", {}).get("percent", 0.0)
                next_prob = next_data.get("precipitation", {}).get("probability", {}).get("percent", 0.0)
                interp_prob = interpolate(prev_prob, next_prob, fraction)

                # Use now_utc as the time, formatted as ISO8601
                results[city] = {
                    "time": now_utc.isoformat().replace("+00:00", "Z"),
                    "qpf_mm": round(interp_qpf, 4),
                    "rain_probability_pct": round(interp_prob, 1),
                }
            elif next_point:
                # Only next_point available, no interpolation possible
                dt, data = next_point
                results[city] = {
                    "time": dt.isoformat().replace("+00:00", "Z"),
                    "qpf_mm": data.get("precipitation", {}).get("qpf", {}).get("quantity", 0.0),
                    "rain_probability_pct": data.get("precipitation", {}).get("probability", {}).get("percent", 0.0)
                }
            else:
                results[city] = {"message": "No forecast points found"}

        return jsonify({
            "status": "success",
            "requested_at": now_utc.isoformat().replace("+00:00", "Z"),
            "data": results
        })

    except requests.HTTPError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
