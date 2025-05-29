import React, { useEffect, useState } from "react";
import "./WeatherCard.css"
import logo from '../assets/logo.png';
import cloud from '../assets/cloud.png';

interface currentConditions {
  probability: number,
  qpf: number,
  probabilityForecast: number,
  qpfForecast: number,
}

const WeatherCard: React.FC<currentConditions> = ({ probability, qpf, probabilityForecast, qpfForecast }) => (

  <div className="container-overall">
    <div className="blue-container">
      <div className="blue-container-title">_____________________________________________WEATHER FORECAST</div>
      <div className="blue-inner-grid">
        <img src={cloud}></img>
        <div>PROBABILITY%</div>
        <div className="blue-inner-grid-bottom-text" >{qpf} mm</div>
        <div className="blue-inner-grid-bottom-text">{probability}%</div>
      </div>
    </div>
    <div className="orange-container">
      <div className="orange-logo-wrapper">
        <img src={logo} alt="CEAT LOGO" />
        
      </div>
      <div className="orange-container-title">TOMORROW'S FORECAST</div>
      <div className="orange-inner-grid">
        <img src={cloud}></img>
        <div className="orange-inner-grid-text">PROBABILITY%</div>
        <div className="orange-inner-grid-text">{qpfForecast} mm</div>
        <div className="orange-inner-grid-text">{probabilityForecast}%</div>
      </div>
    </div>
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
    <div>
      {weatherData && <WeatherCard {...weatherData} />}
    </div>
  );
};

export default WeatherDashboard;
