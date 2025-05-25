import React, { useEffect, useState } from "react";

interface currentConditions {
  probability: number,
  qpf: number,
}

const WeatherCard: React.FC<currentConditions> = ({ probability, qpf}) => (
  <div className="rounded-2xl shadow-md p-4 bg-white flex flex-col items-center gap-2 w-60">
    <div>Today's Probability: {probability}%</div>
    <div>Today's Rainfall: {qpf} mm</div>
  </div>
);

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<currentConditions | null>(null);

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
      <h1>WeatherData</h1>     
         {weatherData && <WeatherCard {...weatherData} />}
  </div>
  );
};

export default WeatherDashboard;
