import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());

interface ProbabilityData {
    label: string;
    probability?: number; 
    qpf?: number;
    probabilityForecast?: number;
    qpfForecast?: number;
}

app.get('/api/weather', (req: Request, res: Response) => {
    (async () => {
        const apiKey = process.env.WEATHER_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Weather API key not configured' });
        }
        
        const lat: string = (req.query.lat as string) || '19.043246';
        const lon: string = (req.query.lon as string) || '72.857086';

        // Current conditions URL
        const url_1 = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`;
        // Forecast URL
        const url_2 = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&days=2`;

        try {
            const [response_1, response_2] = await Promise.all([
                axios.get(url_1),
                axios.get(url_2)
            ]);

            const data_1 = response_1.data;
            const data_2 = response_2.data;

            const currentCondition: ProbabilityData = {
                label: "Weather precipitation data",
                probability: data_1.precipitation?.probability?.percent,
                qpf: data_1.precipitation?.qpf?.quantity,
                probabilityForecast: data_2.forecastDays?.[1]?.daytimeForecast?.precipitation?.probability?.percent,
                qpfForecast: data_2.forecastDays?.[1]?.daytimeForecast?.precipitation?.qpf?.quantity,
            };

            res.json(currentCondition);
        } catch (error: any) {
            console.error("Error fetching weather:", error.message);
            if (error.response) {
                console.error("API Response Status:", error.response.status);
                console.error("API Response Data:", error.response.data);
            }
            res.status(500).json({ error: "Weather fetch failed", details: error.message });
        }
    })();
});

app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
});