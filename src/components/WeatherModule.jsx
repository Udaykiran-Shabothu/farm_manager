import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  MapPin, 
  Search, 
  Sprout, 
  Milk, 
  Egg, 
  Compass,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  Gauge
} from 'lucide-react';

// Preset Major Agricultural Districts (Coordinates for Open-Meteo API)
const FARM_LOCATIONS = [
  { name: 'Hyderabad / Ranga Reddy', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Warangal / Hanamkonda', state: 'Telangana', lat: 17.9784, lon: 79.5941 },
  { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
  { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  { name: 'Amaravati / Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Anantapur / Rayalaseema', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { name: 'Bengaluru / Kolar', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Nashik', state: 'Maharashtra', lat: 20.0059, lon: 73.7898 }
];

// Fallback Offline Weather Data (Guarantees Application Never Crashes)
const FALLBACK_WEATHER = {
  isOffline: true,
  cityName: 'Hyderabad / Ranga Reddy (Offline Fallback)',
  temp: 29,
  feelsLike: 31,
  humidity: 62,
  windSpeed: 12,
  rainProb: 15,
  precipitation: 0,
  weatherCode: 2, // Partly Cloudy
  description: 'Partly Cloudy & Pleasant',
  forecast: [
    { day: 'Today', maxTemp: 31, minTemp: 22, rainProb: 15, rainSum: 0, code: 2, text: 'Partly Cloudy' },
    { day: 'Tomorrow', maxTemp: 32, minTemp: 23, rainProb: 40, rainSum: 1.2, code: 3, text: 'Cloudy' },
    { day: 'Day 3', maxTemp: 29, minTemp: 21, rainProb: 75, rainSum: 12.5, code: 61, text: 'Light Rain' },
    { day: 'Day 4', maxTemp: 28, minTemp: 20, rainProb: 60, rainSum: 6.0, code: 63, text: 'Moderate Rain' },
    { day: 'Day 5', maxTemp: 30, minTemp: 21, rainProb: 20, rainSum: 0.2, code: 1, text: 'Mainly Clear' }
  ]
};

// Weather Code Translator
const getWeatherDescription = (code) => {
  const c = Number(code) || 0;
  if (c === 0) return { text: 'Clear Sky / Sunny', icon: Sun, color: 'text-amber-500' };
  if (c >= 1 && c <= 3) return { text: 'Partly Cloudy', icon: CloudSun, color: 'text-emerald-500' };
  if (c >= 45 && c <= 48) return { text: 'Foggy / Hazy Morning', icon: CloudSun, color: 'text-slate-400' };
  if (c >= 51 && c <= 55) return { text: 'Light Drizzle', icon: CloudRain, color: 'text-cyan-500' };
  if (c >= 61 && c <= 65) return { text: 'Rain Showers', icon: CloudRain, color: 'text-blue-500' };
  if (c >= 80 && c <= 82) return { text: 'Heavy Rain / Thunderstorm', icon: CloudRain, color: 'text-indigo-600' };
  return { text: 'Overcast / Mild Clouds', icon: CloudSun, color: 'text-teal-600' };
};

export default function WeatherModule() {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('samagra_weather_location');
      return saved ? JSON.parse(saved) : FARM_LOCATIONS[0];
    } catch (e) {
      return FARM_LOCATIONS[0];
    }
  });

  const [weatherData, setWeatherData] = useState(FALLBACK_WEATHER);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [customSearchText, setCustomSearchText] = useState('');

  // Save selected location
  const handleLocationChange = (loc) => {
    if (!loc) return;
    setSelectedLocation(loc);
    try {
      localStorage.setItem('samagra_weather_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Fetch Live Weather Data from Free Open-Meteo API
  const fetchWeather = useCallback(async (locationToFetch) => {
    const loc = locationToFetch || selectedLocation;
    if (!loc || !loc.lat || !loc.lon) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const json = await response.json();
      if (!json || !json.current || !json.daily) throw new Error('Invalid weather API payload');

      const curr = json.current;
      const daily = json.daily;

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const formattedForecast = (daily.time || []).map((dateStr, idx) => {
        const d = new Date(dateStr);
        const dayLabel = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : isNaN(d.getDay()) ? `Day ${idx + 1}` : daysOfWeek[d.getDay()];
        const code = daily.weather_code?.[idx] ?? 0;
        const info = getWeatherDescription(code);

        return {
          day: dayLabel,
          date: dateStr,
          maxTemp: Math.round(Number(daily.temperature_2m_max?.[idx]) || 30),
          minTemp: Math.round(Number(daily.temperature_2m_min?.[idx]) || 20),
          rainProb: Math.round(Number(daily.precipitation_probability_max?.[idx]) || 0),
          rainSum: Number((daily.precipitation_sum?.[idx] || 0).toFixed(1)),
          code: code,
          text: info.text
        };
      }).slice(0, 5);

      const currentDesc = getWeatherDescription(curr.weather_code);

      setWeatherData({
        isOffline: false,
        cityName: loc.name,
        temp: Math.round(Number(curr.temperature_2m) || 28),
        feelsLike: Math.round(Number(curr.apparent_temperature) || 30),
        humidity: Math.round(Number(curr.relative_humidity_2m) || 60),
        windSpeed: Math.round(Number(curr.wind_speed_10m) || 10),
        rainProb: Math.round(Number(daily.precipitation_probability_max?.[0]) || 0),
        precipitation: Number((curr.precipitation || 0).toFixed(1)),
        weatherCode: curr.weather_code || 0,
        description: currentDesc.text,
        forecast: formattedForecast
      });

    } catch (err) {
      console.warn('Weather API fetch failed, using fallback mode:', err);
      setErrorMsg('Using offline seasonal fallback data. Click refresh to retry live satellite sync.');
      setWeatherData({
        ...FALLBACK_WEATHER,
        cityName: `${loc.name} (Offline Mode)`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [selectedLocation, fetchWeather]);

  // Use Browser GPS Location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsLoc = {
          name: `My GPS Location (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
          state: 'GPS',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        handleLocationChange(gpsLoc);
      },
      (err) => {
        setLoading(false);
        alert('Could not retrieve GPS coordinates. Please select a district from the dropdown list.');
      },
      { timeout: 8000 }
    );
  };

  // Filter Locations Search
  const filteredLocations = FARM_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(customSearchText.toLowerCase()) || 
    l.state.toLowerCase().includes(customSearchText.toLowerCase())
  );

  // Derive Smart Farm Advisories
  const currentTemp = Number(weatherData.temp) || 28;
  const currentRainProb = Number(weatherData.rainProb) || 0;
  const currentWind = Number(weatherData.windSpeed) || 10;
  const maxForecastTemp = Math.max(...(weatherData.forecast || []).map(f => Number(f.maxTemp) || 30));
  const minForecastTemp = Math.min(...(weatherData.forecast || []).map(f => Number(f.minTemp) || 20));

  // 1. Crop Irrigation Advisory
  const getIrrigationAdvisory = () => {
    if (currentRainProb > 55 || (weatherData.forecast?.[0]?.rainSum || 0) > 3) {
      return {
        status: 'PAUSE IRRIGATION',
        color: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        badgeColor: 'bg-cyan-600 text-white',
        icon: CloudRain,
        text: 'High rain probability today (>50%). Pause automated canal & borewell pumps to avoid soil waterlogging and save electricity.'
      };
    } else if (currentTemp > 35) {
      return {
        status: 'HEAVY DRIP WATERING NEEDED',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeColor: 'bg-amber-600 text-white',
        icon: Sun,
        text: 'High temperature heat stress. Schedule early morning or late evening drip irrigation to minimize evaporation loss.'
      };
    }
    return {
      status: 'NORMAL IRRIGATION SCHEDULE',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      text: 'Optimal weather. Maintain standard crop watering routines for paddy, cotton, and vegetables.'
    };
  };

  // 2. Pesticide & Spray Advisory
  const getSprayAdvisory = () => {
    if (currentWind > 18) {
      return {
        status: 'DO NOT SPRAY (HIGH WIND)',
        color: 'bg-rose-100 text-rose-900 border-rose-300',
        badgeColor: 'bg-rose-600 text-white',
        icon: Wind,
        text: `Wind speed is elevated (${currentWind} km/h). Avoid chemical sprays to prevent dangerous spray drift onto neighboring fields.`
      };
    } else if (currentRainProb > 45) {
      return {
        status: 'POSTPONE SPRAYING (RAIN RISK)',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeColor: 'bg-amber-600 text-white',
        icon: AlertTriangle,
        text: 'Likely rain expected. Chemical & fertilizer sprays may get washed off from leaf surfaces. Wait for clear skies.'
      };
    }
    return {
      status: 'SAFE FOR FOLIAR SPRAYING',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      text: 'Low wind and clear skies. Great time for applying neem oil, organic bio-pesticides, or micronutrient foliar sprays.'
    };
  };

  // 3. Dairy Cattle Thermal Comfort Advisory
  const getDairyAdvisory = () => {
    if (maxForecastTemp > 37) {
      return {
        status: 'EXTREME CATTLE HEAT STRESS',
        color: 'bg-rose-100 text-rose-900 border-rose-300',
        badgeColor: 'bg-rose-600 text-white',
        icon: ShieldAlert,
        text: `Extreme temperature expected (${maxForecastTemp}°C). Provide shaded sheds, continuous fresh drinking water, and mist fans to prevent drop in milk yield.`
      };
    } else if (minForecastTemp < 17) {
      return {
        status: 'COLD NIGHT SHED PROTECTION',
        color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        badgeColor: 'bg-indigo-600 text-white',
        icon: Thermometer,
        text: 'Chilly night temperatures. Cover cattle sheds with gunny curtains and provide dry straw bedding for young calves.'
      };
    }
    return {
      status: 'OPTIMAL DAIRY BARN CONDITIONS',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      text: 'Comfortable ambient temperature. Normal feeding routines will sustain peak milk yield.'
    };
  };

  // 4. Poultry Heat / Brooder Advisory
  const getPoultryAdvisory = () => {
    if (maxForecastTemp > 36) {
      return {
        status: 'POULTRY HEAT RISK (ADD ELECTROLYTES)',
        color: 'bg-rose-100 text-rose-900 border-rose-300',
        badgeColor: 'bg-rose-600 text-white',
        icon: ShieldAlert,
        text: 'High heat degrades flock appetite. Add Vitamin C & electrolyte supplements to poultry drinking water.'
      };
    } else if (minForecastTemp < 18) {
      return {
        status: 'BROODER HEATER REQUIRED',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        badgeColor: 'bg-amber-600 text-white',
        icon: Thermometer,
        text: 'Cool night temperature (<18°C). Turn on heat brooders for young chicks to prevent huddling mortality.'
      };
    }
    return {
      status: 'GOOD POULTRY SHED COMFORT',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeColor: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
      text: 'Ambient shed temperature is in the ideal comfort zone for layers and broilers.'
    };
  };

  const irrigationInfo = getIrrigationAdvisory();
  const sprayInfo = getSprayAdvisory();
  const dairyInfo = getDairyAdvisory();
  const poultryInfo = getPoultryAdvisory();

  const CurrentWeatherIcon = getWeatherDescription(weatherData.weatherCode).icon;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shadow-sm">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Weather Forecast & Smart Farm Advisory</h1>
              <p className="text-xs text-slate-500 font-medium">Real-time satellite weather insights & precision agricultural recommendations</p>
            </div>
          </div>
        </div>

        {/* Location Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Preset Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const found = FARM_LOCATIONS.find(l => l.name === e.target.value);
                if (found) handleLocationChange(found);
              }}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              {FARM_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  📍 {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* GPS Button */}
          <button
            onClick={handleUseGPS}
            title="Use Current Device GPS Location"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Use GPS Location</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchWeather(selectedLocation)}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

        </div>
      </div>

      {/* Offline Mode Banner Notice */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={() => fetchWeather(selectedLocation)} 
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold"
          >
            Retry Live Sync
          </button>
        </div>
      )}

      {/* MAIN HERO WEATHER CARD & 5-DAY FORECAST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hero Current Weather Panel */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl card-3d shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          
          {/* Ambient Glow Pill */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Location Title & Status */}
          <div>
            <div className="flex items-center justify-between text-xs text-teal-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> {selectedLocation.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-900/80 border border-teal-700 text-[10px] text-teal-200">
                {weatherData.isOffline ? 'Cached Data' : 'Live Satellite'}
              </span>
            </div>
            
            {/* Main Temperature Display */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {currentTemp}°<span className="text-3xl font-light text-slate-400">C</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold mt-1">
                  Feels like {Number(weatherData.feelsLike) || currentTemp}°C • {weatherData.description}
                </p>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-amber-300 shadow-inner">
                <CurrentWeatherIcon className="w-12 h-12 stroke-[1.75]" />
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Pill Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm text-center">
              <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Humidity</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{Number(weatherData.humidity) || 60}%</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm text-center">
              <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Wind</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{currentWind} <span className="text-[10px] font-normal text-slate-400">km/h</span></p>
            </div>

            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm text-center">
              <CloudRain className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rain Chance</p>
              <p className="text-sm font-extrabold text-white mt-0.5">{currentRainProb}%</p>
            </div>

          </div>

        </div>

        {/* 5-Day Forecast Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">5-Day Agricultural Weather Outlook</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Daily Max/Min & Rainfall Risk</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {(weatherData.forecast || []).map((f, idx) => {
              const DayIcon = getWeatherDescription(f.code).icon;
              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                    idx === 0 
                      ? 'bg-emerald-50/80 border-emerald-200 ring-2 ring-emerald-500/20 shadow-sm' 
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800">{f.day}</span>
                    <DayIcon className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="my-1">
                    <p className="text-lg font-black text-slate-900">{f.maxTemp}°<span className="text-xs text-slate-500 font-normal"> / {f.minTemp}°C</span></p>
                    <p className="text-[10px] text-slate-500 truncate font-semibold">{f.text}</p>
                  </div>

                  {/* Rain Progress Bar */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/60">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>Rain</span>
                      <span className={f.rainProb > 50 ? 'text-blue-600 font-black' : 'text-slate-600'}>{f.rainProb}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${f.rainProb > 50 ? 'bg-blue-600' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, Math.max(5, f.rainProb))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-right">
            <p className="text-[11px] text-slate-400">Powered by Open-Meteo Satellite Meteorological Engine • Updated Live</p>
          </div>
        </div>

      </div>

      {/* 📜 SMART SECTOR-BY-SECTOR AGRICULTURAL ADVISORY CARDS */}
      <div className="space-y-4">
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Precision Smart Farm Advisory System</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* 1. Crop Field Irrigation Advisory */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-emerald-100 rounded-2xl border border-emerald-200 text-emerald-700">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crop Irrigation Advisory</h3>
                  <p className="text-[11px] text-slate-500">Paddy, Cotton, Vegetables & Orchards</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${irrigationInfo.badgeColor}`}>
                {irrigationInfo.status}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${irrigationInfo.color}`}>
              <p className="font-medium text-slate-800">{irrigationInfo.text}</p>
            </div>
          </div>

          {/* 2. Pesticide & Spray Safety Advisory */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-blue-100 rounded-2xl border border-blue-200 text-blue-700">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Foliar Spray & Chemical Safety</h3>
                  <p className="text-[11px] text-slate-500">Pesticide, Fertilizer & Bio-spray timing</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${sprayInfo.badgeColor}`}>
                {sprayInfo.status}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${sprayInfo.color}`}>
              <p className="font-medium text-slate-800">{sprayInfo.text}</p>
            </div>
          </div>

          {/* 3. Dairy Farm Thermal Comfort Advisory */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-cyan-100 rounded-2xl border border-cyan-200 text-cyan-700">
                  <Milk className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dairy Cattle Thermal Comfort</h3>
                  <p className="text-[11px] text-slate-500">Cows & Buffaloes Milk Production Protection</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${dairyInfo.badgeColor}`}>
                {dairyInfo.status}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${dairyInfo.color}`}>
              <p className="font-medium text-slate-800">{dairyInfo.text}</p>
            </div>
          </div>

          {/* 4. Poultry Brooder & Vent Advisory */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-rose-100 rounded-2xl border border-rose-200 text-rose-700">
                  <Egg className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Poultry Shed Environment</h3>
                  <p className="text-[11px] text-slate-500">Chicks Brooding & Layer House Climate</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${poultryInfo.badgeColor}`}>
                {poultryInfo.status}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${poultryInfo.color}`}>
              <p className="font-medium text-slate-800">{poultryInfo.text}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
