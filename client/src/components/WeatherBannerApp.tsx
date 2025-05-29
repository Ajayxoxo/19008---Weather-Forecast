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
  const [urls, setUrls] = useState<Record<SectionKey, string>>({
    forecast: "",
    alerts: "",
    anime: "",
    quotes: ""
  });
  const [nextUrls, setNextUrls] = useState<Record<SectionKey, string>>({
    forecast: "",
    alerts: "",
    anime: "",
    quotes: ""
  });
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(SECTIONS);
  const [nextSectionOrder, setNextSectionOrder] = useState<SectionKey[]>(SECTIONS);
  const [idx, setIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch playlist and prefetch videos
  useEffect(() => {
    const updatePlaylist = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/screen/mumbai");
        const data: SectionMap = await res.json();

        const updatedSectionOrder: SectionKey[] = ["forecast"];
        const newMap: Record<SectionKey, string> = {
          forecast: urls.forecast, // Use existing if no change
          alerts: urls.alerts,
          anime: urls.anime,
          quotes: urls.quotes
        };

        if (data.Section1 !== "No") {
          if (data.Section2) {
            const key2 = Object.keys(data.Section2)[0];
            newMap.alerts = data.Section2[key2];
            updatedSectionOrder.push("alerts");
          }
          if (data.Section3) {
            const key3 = Object.keys(data.Section3)[0];
            newMap.anime = data.Section3[key3];
            updatedSectionOrder.push("anime");
          }
          if (data.Section4) {
            const key4 = Object.keys(data.Section4)[0];
            newMap.quotes = data.Section4[key4];
            updatedSectionOrder.push("quotes");
          }
        }

        setNextSectionOrder(updatedSectionOrder);

        // Prefetch videos for next loop
        const blobPromises = updatedSectionOrder.map(async section => {
          if (newMap[section] && newMap[section] !== urls[section]) {
            try {
              const response = await fetch(newMap[section]);
              const blob = await response.blob();
              return [section, URL.createObjectURL(blob)] as [SectionKey, string];
            } catch {
              return [section, urls[section]] as [SectionKey, string];
            }
          }
          return [section, urls[section]] as [SectionKey, string];
        });

        const resolvedBlobs = await Promise.all(blobPromises);
        setNextUrls(Object.fromEntries(resolvedBlobs) as Record<SectionKey, string>);
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
      }
    };

    updatePlaylist();

    const interval = setInterval(updatePlaylist, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [urls]);

  // On loop reset, apply nextUrls
  useEffect(() => {
    if (idx === 0 && Object.keys(nextUrls).length) {
      setUrls(nextUrls);
      setSectionOrder(nextSectionOrder);
    }
  }, [idx, nextUrls, nextSectionOrder]);

  const handleEnded = () => {
    setIdx((prev) => (prev + 1) % sectionOrder.length);
  };

  const handleForecastEnd = () => {
    setIdx((prev) => (prev + 1) % sectionOrder.length);
  };

  const currentKey = sectionOrder[idx];
  const currentSrc = urls[currentKey] || null;

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
