'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, MapPin, Loader2, Umbrella, Zap, Droplets, ThermometerSnowflake, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';

interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  code: number;
}

export const WeatherWidget = () => {
  const [time, setTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather and location
  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number, cityName?: string) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const data = await response.json();

        let finalCity = cityName;
        // If no city name provided, reverse geocode
        if (!finalCity) {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const geoData = await geoRes.json();
          finalCity = geoData.address.city || geoData.address.town || geoData.address.village || 'Unknown Location';
        }

        const code = data.current.weather_code;
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: code,
          condition: getWeatherConditionString(code),
          city: finalCity || 'Unknown Location'
        });
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchIPLocationFallback = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('IP API failed');
        const data = await res.json();

        if (data && data.latitude && data.longitude) {
          await fetchWeatherData(data.latitude, data.longitude, data.city);
        } else {
          throw new Error('Invalid IP location data');
        }
      } catch (e) {
        console.error("IP fallback failed, using default location (Dhaka).", e);
        // Default to Dhaka if all else fails so the widget doesn't stay loading
        await fetchWeatherData(23.8103, 90.4125, 'Dhaka');
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Geolocation denied or failed, using IP fallback.", error);
          fetchIPLocationFallback();
        },
        { timeout: 5000 }
      );
    } else {
      fetchIPLocationFallback();
    }
  }, []);

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-blue-200" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code >= 95 && code <= 99) return <CloudLightning className="w-8 h-8 text-yellow-600" />;
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };

  const getWeatherConditionString = (code: number) => {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const getWeatherComment = (code: number, temp: number) => {
    if (code >= 51 && code <= 67) return <span className="flex items-center gap-1.5">Don't forget an umbrella! <Umbrella className="w-3.5 h-3.5 text-blue-400 drop-shadow-sm" /></span>;
    if (code >= 71 && code <= 77) return <span className="flex items-center gap-1.5">Bundle up, it's snowing! <Snowflake className="w-3.5 h-3.5 text-blue-200 drop-shadow-sm" /></span>;
    if (code >= 95) return <span className="flex items-center gap-1.5">Stay indoors, thunderstorm! <Zap className="w-3.5 h-3.5 text-yellow-500 drop-shadow-sm" /></span>;
    if (temp >= 30) return <span className="flex items-center gap-1.5">Stay hydrated, it's hot! <Droplets className="w-3.5 h-3.5 text-blue-300 drop-shadow-sm" /></span>;
    if (temp <= 10) return <span className="flex items-center gap-1.5">Wear a warm coat! <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-100 drop-shadow-sm" /></span>;
    if (code === 0) return <span className="flex items-center gap-1.5">Great day for a walk! <Sun className="w-3.5 h-3.5 text-yellow-500 drop-shadow-sm" /></span>;
    return <span className="flex items-center gap-1.5">Perfect weather to reclaim time! <Sparkles className="w-3.5 h-3.5 text-accent drop-shadow-sm" /></span>;
  };

  return (
    <Card className="flex flex-col sm:flex-row justify-between items-center p-6 bg-card border-none shadow-neo-out relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />

      <div className="flex items-center space-x-6 z-10 w-full sm:w-auto">
        <div className="text-5xl font-black tracking-tighter text-foreground">
          {time || '--:--'}
        </div>

        {loading ? (
          <div className="flex items-center space-x-2 text-foreground/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Getting weather...</span>
          </div>
        ) : weather ? (
          <div className="flex items-center space-x-4 border-l-2 border-foreground/10 pl-6">
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl shadow-neo-in">
              {getWeatherIcon(weather.code)}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold flex items-center gap-1">
                {weather.temp}°C
                <span className="text-lg font-medium text-foreground/60 ml-2">
                  {weather.condition}
                </span>
              </span>
              <span className="text-sm font-bold text-foreground/40 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {weather.city}
              </span>
              <span className="text-xs font-medium italic text-foreground/50 mt-1">
                {getWeatherComment(weather.code, weather.temp)}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-l-2 border-foreground/10 pl-6 text-foreground/40 text-sm font-medium">
            Weather unavailable
          </div>
        )}
      </div>
    </Card>
  );
};
