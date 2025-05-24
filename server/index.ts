const express = require('express');
const axios = require('axios');
const cors = require('cors');
import { Request, Response } from 'express';
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());

interface WeatherCondition {
    description?: {
        text?: string;
    };
    iconBaseUri?: string;
}

interface ForecastHour {
    weatherCondition?: WeatherCondition;
    temperature?: {
        degrees?: number;
    };
    relativeHumidity?: number;
}

interface WeatherApiResponse {
    forecastHours: ForecastHour[];
}

interface Forecast {
    condition: string;
    temperature: number;
    humidity: number;
    icon: string;
}


app.get('/api/weather', async (req: Request, res: Response) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const lat: string = (req.query.lat as string) || '19.167688';
    const lon: string = (req.query.lon as string) || '72.848275';

    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&hours=1`;

    try {
        const response = await axios.get(url);
        const forecast: Forecast[] = (response.data as WeatherApiResponse).forecastHours.map((hour: ForecastHour) => ({
            condition: hour.weatherCondition?.description?.text || "Unknown",
            temperature: hour.temperature?.degrees ?? 0,
            humidity: hour.relativeHumidity ?? 0,
            icon: hour.weatherCondition?.iconBaseUri + ".svg" || "",
        }));

        res.json(forecast);
    } catch (error: any) {
        console.error("Error fetching weather:", error.message);
        res.status(500).send("Weather fetch failed");
    }
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
