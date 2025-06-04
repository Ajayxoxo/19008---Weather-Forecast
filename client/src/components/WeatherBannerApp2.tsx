import React, { useState, useEffect, useRef } from "react";
import "./WeatherCard.css";
import logo from "./../assets/logo.png"
import cloud from "./../assets/cloud.png"

const WeatherBannerApp2: React.FC = () => {

  // Dynamic Variable -----------------------------------------
  const fetchWeatherTimer = 900000;
  const fetchVideoTimer = 5000;
  const [section2VideoUrl, setSection2VideoUrl] = useState("/videos/red.mp4");
  const [section3VideoUrl, setSection3VideoUrl] = useState("/videos/rainy.mp4");
  const [section4VideoUrl, setSection4VideoUrl] = useState("/videos/2.mp4");

  // Type script requirements --------------------------------- 
  interface currentConditions {
    probability: number,
    qpf: number,
    probabilityForecast: number,
    qpfForecast: number,
  }

  interface VideoInformation {
    Section2: { [label: string]: string };
    Section3: { [label: string]: string };
    Section4: { [label: string]: string };
  }



  // Use State used for retaining Data-----------------------------------
  const [weatherData, setWeatherData] = useState<currentConditions | null>({
    probability: 25,
    qpf: 1.7,
    probabilityForecast: 30,
    qpfForecast: 6.9,
  });

  const [videoData, setVideoData] = useState<VideoInformation | null>({
    "Section2": {
      "No": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/no.mp4"
    },
    "Section3": {
      "Sunny": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/sunny.mp4"
    },
    "Section4": {
      "2": "https://myvoiceclone.s3.ap-south-1.amazonaws.com/s3/2.mp4"
    }
  })

  // Use Effect funtion that works when rerender happenss
  //Use Effect for weather fetching --------------------
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

    fetchWeather(); // Fetch immediately on mount

    const intervalId = setInterval(fetchWeather, fetchWeatherTimer); // Repeat every 900,000 ms (15 minutes)

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);
  //Use Effect for Video fetching --------------------
  // 1. Fetch videoData from API
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/screen/mumbai");
        const data = await res.json();
        setVideoData(data); // ✅ only update state
        console.log("fetched new data");
      } catch (error) {
        console.error("Video API error:", error);
      }
    };

    fetchVideoData();

    const intervalId = setInterval(fetchVideoData, fetchVideoTimer); // Repeat every 900,000 ms (15 minutes)

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  useEffect(() => {
    if (!videoData) return;

    const section2Key = Object.keys(videoData.Section2 || {})[0];
    const section3Key = Object.keys(videoData.Section3 || {})[0];
    const section4Key = Object.keys(videoData.Section4 || {})[0];

    // Match keys to LOCAL file paths (not using API URLs)
    const localSection2Map: Record<string, string> = {
      "Red": "/videos/red.mp4",
      "Orange": "/videos/orange.mp4",
      "Yellow": "/videos/yellow.mp4",
    };

    const localSection3Map: Record<string, string> = {
      "Rainy": "/videos/rainy.mp4",
      "Cloudy": "/videos/cloudy.mp4",
      "Sunny": "/videos/sunny.mp4",
      "Floody": "/videos/floody.mp4",
    };

    const localSection4Map: Record<string, string> = {
      "1": "/videos/1.mp4",
      "2": "/videos/2.mp4",
      "3": "/videos/3.mp4",
      "4": "/videos/4.mp4",
    };

    if (localSection2Map[section2Key]) {
      setSection2VideoUrl(localSection2Map[section2Key]);
    }

    if (localSection3Map[section3Key]) {
      setSection3VideoUrl(localSection3Map[section3Key]);
    }

    if (localSection4Map[section4Key]) {
      setSection4VideoUrl(localSection4Map[section4Key]);
    }

  }, [videoData]);




  //React Component ------------------------------------------------
  const WeatherCard: React.FC<currentConditions> = ({ probability, qpf, probabilityForecast, qpfForecast }) => (
    <div className="container-overall">
      <div className="blue-container">
        <div className="blue-container-title">WEATHER FORECAST</div>
        <div className="blue-inner-grid">
          <img src={cloud}></img>
          <div>PROBABILITY%</div>
          <div className="blue-inner-grid-bottom-text" >{qpf}mm</div>
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
          <div className="orange-inner-grid-text">{qpfForecast}mm</div>
          <div className="orange-inner-grid-text">{probabilityForecast}%</div>
        </div>
      </div>
    </div>
  );

  // VIDEO LOGIC-----------------------------------------------
  const [section1, handleSection1] = useState(false);
  const [section2, handleSection2] = useState(true);
  const [section3, handleSection3] = useState(false);
  const [section4, handleSection4] = useState(false);

  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const videoRef4 = useRef<HTMLVideoElement>(null);

  function handleEndedSection1(): React.ReactEventHandler<HTMLVideoElement> {
    return () => {
      console.log("Section 1 ended");
      handleSection1(prev => !prev);

      // Get section2Key from videoData
      const section2Key = videoData && videoData.Section2 ? Object.keys(videoData.Section2)[0] : undefined;

      if (section2Key === "No") {
        // Skip Section2, go directly to Section3
        handleSection3(true);
        if (videoRef3.current) videoRef3.current.play();
      } else {
        // Play Section2 normally
        handleSection2(true);
        if (videoRef2.current) videoRef2.current.play();
      }
    };
  }

  function handleEndedSection2(): React.ReactEventHandler<HTMLVideoElement> {
    return () => {
      console.log("Section 2 video has ended");
      handleSection2(false);
      handleSection3(prev => !prev);
      if (videoRef3.current) {
        videoRef3.current.play();
      }
    };
  }

  function handleEndedSection3(): React.ReactEventHandler<HTMLVideoElement> {
    return () => {
      console.log("Section 3 video has ended");
      handleSection3(prev => !prev);
      handleSection4(prev => !prev);
      if (videoRef4.current) {
        videoRef4.current.play();
      }
    };
  }

  function handleEndedSection4(): React.ReactEventHandler<HTMLVideoElement> {
    return () => {
      console.log("Section 4 video has ended");
      handleSection4(prev => !prev);
      handleSection1(prev => !prev);
      setTimeout(() => handleEndedSection1()({} as React.SyntheticEvent<HTMLVideoElement>), 5000);
    };
  }
  //actuall body -----------------------------------------------
  return (

    <div className="fullscreen-banner">
      {section1 && weatherData && <WeatherCard
        probability={weatherData.probability}
        qpf={weatherData.qpf}
        probabilityForecast={weatherData.probabilityForecast}
        qpfForecast={weatherData.qpfForecast}
      />}

      { section2 && <video
        src={section2VideoUrl}
        autoPlay
        muted
        ref={videoRef2}
        onEnded={handleEndedSection2()}
        className="fullscreen-video"
      />}

      {section3 && <video
        src={section3VideoUrl}
        autoPlay
        muted
        ref={videoRef3}
        onEnded={handleEndedSection3()}
        className="fullscreen-video"
      />}

      {section4 && <video
        src={section4VideoUrl}
        autoPlay
        muted
        ref={videoRef4}
        onEnded={handleEndedSection4()}
        className="fullscreen-video"
      />}
    </div>
  );
};

export default WeatherBannerApp2;
