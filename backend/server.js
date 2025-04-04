import fetch from 'node-fetch';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // Parse JSON bodies

const API_KEY = process.env.OPENWEATHER_API_KEY;

// POST route to fetch AQI data from OpenWeather
app.post('/aqi', async (req, res) => {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const aqi_url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        console.log(`Fetching AQI from: ${aqi_url}`);
        const response = await fetch(aqi_url);

        if (!response.ok) throw new Error("API request failed");

        const aqiData = await response.json();

        const aqiLevel = aqiData.list[0].main.aqi;
        const components = aqiData.list[0].components;

        const result = {
            aqi_level: aqiLevel,
            aqi: components,
            lat: lat,
            lon: lon,
            timestamp: aqiData.list[0].dt
        };

        console.log("API Response:", result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching AQI:", error);
        res.status(500).json({ error: "Failed to fetch AQI", details: error.message });
    }
});

app.get('/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const name = data[0]?.name || data[0]?.state || data[0]?.country || "Unknown Location";
        res.json({ name });
    } catch (err) {
        console.error("Error in reverse geocoding:", err.message);
        res.status(500).json({ error: "Failed to reverse geocode" });
    }
});


// Serve Cesium access token
app.get('/cesium-key', (req, res) => {
    res.json({ key: process.env.CESIUM_ACCESS_TOKEN });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
