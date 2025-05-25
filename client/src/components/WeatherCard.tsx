import React, { useEffect, useState } from "react";

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  icon: string;
}

const WeatherCard: React.FC<WeatherData> = ({ condition, temperature, humidity, icon }) => (
  <div className="rounded-2xl shadow-md p-4 bg-white flex flex-col items-center gap-2 w-60">
    <img src={icon} alt={condition} className="w-16 h-16" />
    <div className="text-xl font-semibold">{condition}</div>
    <div>🌡️ {temperature}°C</div>
    <div>💧 Humidity: {humidity}%</div>
  </div>
);

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  useEffect(() => {
  const fetchWeather = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/weather");
    const data = await res.json();
    console.log(data);
    setWeatherData(data);
  } catch (error) {
    console.error("Weather API error:", error);
  }
};


  fetchWeather();
}, []);


  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
      {weatherData.map((entry, index) => (
        <WeatherCard key={index} {...entry} />
      ))}
    </div>
  );
};

export default WeatherDashboard;
