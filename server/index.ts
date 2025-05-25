const express = require('express');
const axios = require('axios');
const cors = require('cors');
import { Request, Response } from 'express';
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());


interface currentConditions {
    label: string;
    probability: number; 
    qpf: number;
}


app.get('/api/weather', async (req: Request, res: Response) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const lat: string = (req.query.lat as string) || '19.043246';
    const lon: string = (req.query.lon as string) || '72.857086';

    //const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=AIzaSyCBe0cnqJ8G2EgoLTe7tihFcfu3BApA488&location.latitude=19.043246&location.longitude=72.857086`;
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}`;
    
    //const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&hours=1`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        console.log(response);
        const currentCondition: currentConditions = {
            label:" just for debugging ",
            probability: data.precipitation?.probability?.percent,
            qpf: data.currentConditionsHistory?.qpf?.quantity,
        }

        res.json(currentCondition);
    } catch (error: any) {
        console.error("Error fetching weather:", error.message);
        res.status(500).send("Weather fetch failed");
    }
});

app.listen(PORT, () => {
  console.log(`Backend listening at http://localhost:${PORT}`);
});
