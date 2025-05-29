import React, { useEffect, useState, useRef } from "react";
import WeatherCard from "./WeatherCard";
import "./WeatherCard.css";

// Type aliases for clarity
type SectionMap = {
  Section1: "Red" | "Orange" | "Yellow" | "No";
  Section2?: Record<string, string>;
  Section3?: Record<string, string>;
  Section4?: Record<string, string>;
};

type SectionKey = "forecast" | "alerts" | "anime" | "quotes";

const SECTIONS: SectionKey[] = ["forecast", "alerts", "anime", "quotes"];

// Wrapper for WeatherCard that triggers onDone after a timeout
const WeatherCardWrapper: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 20000); // Display duration for WeatherCard in ms

    return () => clearTimeout(timer);
  }, [onDone]);

  return <WeatherCard />;
};

const WeatherBannerApp: React.FC = () => {
  
  return (
    <div className="fullscreen-banner">
      {currentKey === "forecast" ? (
        <WeatherCardWrapper onDone={handleForecastEnd} />
      ) : currentSrc ? (
        <video
          key={currentKey} // force re-render when video changes
          ref={videoRef}
          src={currentSrc}
          onEnded={handleEnded}
          autoPlay
          muted
          className="fullscreen-video"
        />
      ) : null}
    </div>
  );
};

export default WeatherBannerApp;
