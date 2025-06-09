import React, { useState, useEffect, useRef } from "react";
import "./WeatherCard.css";
import logo from "./../assets/logo.png";
import cloudDay from "./../assets/cloud.png";
import cloudNight from "./../assets/cloud-night.png"; // Placeholder for night image

const WeatherBannerApp2: React.FC = () => {
  // Dynamic Variables
  const fetchWeatherTimer = 900000;
  const fetchVideoTimer = 5000;
  const weatherCardDisplayTime = 5000; // Duration (in ms) that each WeatherCard (section1 or section5) is visible

  // State for video URLs
  const [section2VideoUrl, setSection2VideoUrl] = useState<string>("/videos/red.mp4");
  const [section3VideoUrl, setSection3VideoUrl] = useState<string>("/videos/rainy.mp4");
  const [section4VideoUrl, setSection4VideoUrl] = useState<string>("/videos/2.mp4");

  // Interfaces
  interface currentConditions {
    probability: number;
    qpf: number;
    probabilityForecast: number;
    qpfForecast: number;
    isDaytime: boolean;
  }

  interface VideoInformation {
    Section2: { [label: string]: string };
    Section3: { [label: string]: string };
    Section4: { [label: string]: string };
  }

  // State for weather and video data
  const [weatherData, setWeatherData] = useState<currentConditions | null>({
    probability: 25,
    qpf: 1.7,
    probabilityForecast: 30,
    qpfForecast: 6.9,
    isDaytime: false,
  });
  const [videoData, setVideoData] = useState<VideoInformation | null>({
    Section2: { No: "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/no.mp4" },
    Section3: { Sunny: "https://myvoiceclone.s3.ap-south-1.amazonaws.com/sunny.mp4" },
    Section4: { "2": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/2.mp4" },
  });

  // Section state flags - start with section1 (WeatherCard1) visible
  const [section1, setSection1] = useState<boolean>(true);
  const [section2, setSection2] = useState<boolean>(false);
  const [section3, setSection3] = useState<boolean>(false);
  const [section4, setSection4] = useState<boolean>(false);
  const [section5, setSection5] = useState<boolean>(true); // New section for WeatherCard2

  // Refs for video elements
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const videoRef4 = useRef<HTMLVideoElement>(null);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/weather");
        const data = await res.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Weather API error:", error);
      }
    };

    fetchWeather();
    const intervalId = setInterval(fetchWeather, fetchWeatherTimer);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch video mapping data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/screen/mumbai");
        const data = await res.json();
        setVideoData(data);
        console.log("fetched new data");
      } catch (error) {
        console.error("Video API error:", error);
      }
    };

    fetchVideoData();
    const intervalId = setInterval(fetchVideoData, fetchVideoTimer);
    return () => clearInterval(intervalId);
  }, []);

  // Update local video URLs when videoData changes
  useEffect(() => {
    if (!videoData) return;
    const section2Key = Object.keys(videoData.Section2 || {})[0];
    const section3Key = Object.keys(videoData.Section3 || {})[0];
    const section4Key = Object.keys(videoData.Section4 || {})[0];

    const localSection2Map: Record<string, string> = {
      Red: "/videos/red.mp4",
      Orange: "/videos/orange.mp4",
      Yellow: "/videos/yellow.mp4",
    };
    const localSection3Map: Record<string, string> = {
      Rainy: "/videos/rainy.mp4",
      Cloudy: "/videos/cloudy.mp4",
      Sunny: "/videos/sunny.mp4",
      Floody: "/videos/floody.mp4",
    };
    const localSection4Map: Record<string, string> = {
      "1": "/videos/1.mp4",
      "2": "/videos/2.mp4",
      "3": "/videos/3.mp4",
      "4": "/videos/4.mp4",
    };

    if (localSection2Map[section2Key]) setSection2VideoUrl(localSection2Map[section2Key]);
    if (localSection3Map[section3Key]) setSection3VideoUrl(localSection3Map[section3Key]);
    if (localSection4Map[section4Key]) setSection4VideoUrl(localSection4Map[section4Key]);
  }, [videoData]);

  // Weather card components
  const WeatherCard1: React.FC<currentConditions> = ({ probability, probabilityForecast, isDaytime }) => {
    const containerClass = isDaytime ? "container-overall" : "container-overall night";
    const iconSrc = isDaytime ? cloudDay : cloudNight;
    return (
      <div className={containerClass}>

        <div className="blue-container">
          <div className="blue-container-title">WEATHER FORECAST</div>
            <img className="blue-img"src={iconSrc} alt="cloud"></img>
            <div className="blue-text-up">PROBABILITY</div>
            <div className="blue-text-down">{probability}%</div>
        </div>

        <div className="orange-container">
          {/* <div className="orange-logo-wrapper">
            <img src={logo} alt="CEAT LOGO" />
          </div> */}
          <div className="orange-container-title">TOMORROW'S FORECAST</div>
            {/* <img className="blue-img"src={iconSrc} alt="cloud"></img> */}
            <div className="orange-text-up">PROBABILITY</div>
            <div className="orange-text-down">{probabilityForecast}%</div>
        </div>
      </div>
    );
  };

  const WeatherCard2: React.FC<currentConditions> = ({ probability, qpf, probabilityForecast, qpfForecast, isDaytime }) => {
    const containerClass = isDaytime ? "container-overall" : "container-overall night";
    const iconSrc = isDaytime ? cloudDay : cloudNight;
    return (
      <div className={containerClass}>

        <div className="blue-container">
          <div className="blue-container-title">WEATHER FORECAST</div>
            <img src={iconSrc} alt="weather icon" />
            <div className="">{qpf}mm</div>
        </div>

        <div className="orange-container">
          {/* <div className="orange-logo-wrapper">
            <img src={logo} alt="CEAT LOGO" />
          </div> */}
          <div className="orange-container-title">TOMORROW'S FORECAST</div>
            <img src={iconSrc} alt="weather icon" />
            <div className="orange-inner-grid-text">{qpfForecast}mm</div>
        </div>
      </div>
    );
  };

  // Handlers for section transitions
  function goToSection2Or3(): void {
    const section2Key = videoData && videoData.Section2 ? Object.keys(videoData.Section2)[0] : undefined;
    if (section2Key === "No") {
      setSection3(true);
      videoRef3.current?.play();
    } else {
      setSection2(true);
      videoRef2.current?.play();
    }
  }

  function handleEndedSection1(): void {
    setSection1(false);
    goToSection2Or3();
  }

  function handleEndedSection2(): void {
    setSection2(false);
    setSection3(true);
    videoRef3.current?.play();
  }

  function handleEndedSection3(): void {
    setSection3(false);
    setSection4(true);
    videoRef4.current?.play();
  }

  function handleEndedSection4(): void {
    setSection4(false);
    setSection5(true);
    // Show WeatherCard2 (section5) for weatherCardDisplayTime, then move to section1
    setTimeout(() => {
      setSection5(false);
      setSection1(true);
    }, weatherCardDisplayTime);
  }

  // Timer effect for section1 (WeatherCard1)
  useEffect(() => {
    let timerId: number;
    if (section1) {
      // When section1 becomes active, schedule transition after weatherCardDisplayTime
      timerId = setTimeout(() => {
        handleEndedSection1();
      }, weatherCardDisplayTime);
    }
    return () => clearTimeout(timerId);
  }, [section1]);

  // Main render
  return (
    <div className="outer-fixed-container">
    
    
     {/*{section5 && weatherData && (
        <WeatherCard1
          probability={weatherData.probability}
          qpf={weatherData.qpf}
          probabilityForecast={weatherData.probabilityForecast}
          qpfForecast={weatherData.qpfForecast}
          isDaytime={weatherData.isDaytime}
        />
      )} */} 
       {section1 && weatherData && (
        <WeatherCard1
          probability={weatherData.probability}
          qpf={weatherData.qpf}
          probabilityForecast={weatherData.probabilityForecast}
          qpfForecast={weatherData.qpfForecast}
          isDaytime={weatherData.isDaytime}
        />
      )}

      {section2 && (
        <video
          src={section2VideoUrl}
          autoPlay
          muted
          ref={videoRef2}
          onEnded={handleEndedSection2}
          className="fullscreen-video"
        />
      )}

      {section3 && (
        <video
          src={section3VideoUrl}
          autoPlay
          muted
          ref={videoRef3}
          onEnded={handleEndedSection3}
          className="fullscreen-video"
        />
      )}

      {section4 && (
        <video
          src={section4VideoUrl}
          autoPlay
          muted
          ref={videoRef4}
          onEnded={handleEndedSection4}
          className="fullscreen-video"
        />
      )}

      {section5 && weatherData && (
        <WeatherCard2
          probability={weatherData.probability}
          qpf={weatherData.qpf}
          probabilityForecast={weatherData.probabilityForecast}
          qpfForecast={weatherData.qpfForecast}
          isDaytime={weatherData.isDaytime}
        />
      )} 
    </div>
   
  );
};

export default WeatherBannerApp2;
