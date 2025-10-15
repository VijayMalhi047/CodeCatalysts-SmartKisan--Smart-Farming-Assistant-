import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { MessageCircle, Search, MapPin, Navigation, Sun, CloudRain, Droplets, Wind, Sprout, Calendar, TrendingUp, Settings, Brain, Cloud, Thermometer } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';

function Dashboard() {
  const { settings } = useSettings();
  const currentLanguage = settings?.language || 'en';
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ name: 'Lahore', lat: '31.5204', lng: '74.3587' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Popular Pakistani cities with coordinates
  const popularCities = [
    { name: 'Lahore', lat: '31.5204', lng: '74.3587' },
    { name: 'Karachi', lat: '24.8607', lng: '67.0011' },
    { name: 'Islamabad', lat: '33.6844', lng: '73.0479' },
    { name: 'Rawalpindi', lat: '33.5651', lng: '73.0169' },
    { name: 'Faisalabad', lat: '31.4504', lng: '73.1350' },
    { name: 'Multan', lat: '30.1575', lng: '71.5249' },
    { name: 'Peshawar', lat: '34.0151', lng: '71.5249' },
    { name: 'Quetta', lat: '30.1798', lng: '66.9750' },
    { name: 'Sialkot', lat: '32.4945', lng: '74.5229' },
    { name: 'Gujranwala', lat: '32.1877', lng: '74.1945' },
    { name: 'Bahawalpur', lat: '29.3544', lng: '71.6911' },
    { name: 'Sargodha', lat: '32.0836', lng: '72.6711' }
  ];

  // Translations
  const translations = {
    en: {
      welcome: "Welcome to SmartKisan",
      subtitle: "Your AI Farming Assistant",
      getWeeklyAdvice: "Get Weekly Advice",
      viewAnalytics: "View Analytics",
      settings: "Settings",
      currentWeather: "Current Weather",
      temperature: "Temperature",
      humidity: "Humidity",
      rainfall: "Rainfall",
      soilMoisture: "Soil Moisture",
      windSpeed: "Wind Speed",
      sevenDayForecast: "7-Day Forecast",
      aiAdvice: "AI Advice",
      viewDetailedAdvice: "View Detailed Advice",
      cropCondition: "Crop Condition",
      cropType: "Crop Type",
      growthStage: "Growth Stage",
      healthStatus: "Health Status",
      irrigationNeed: "Irrigation Need",
      condition: "Condition",
      good: "Good",
      vegetative: "Vegetative",
      medium: "Medium",
      chatWithAI: "Chat with AI",
      aiAdviceText: "Based on current weather patterns, this is the optimal time for irrigation. Consider watering your wheat crop in the next 48 hours for maximum yield.",
      loadingWeather: "Loading weather data...",
      loadingForecast: "Loading forecast...",
      weatherError: "Weather data temporarily unavailable",
      searchPlaceholder: "Search for a city...",
      currentLocation: "Current Location",
      popularCities: "Popular Cities",
      detectLocation: "Detect My Location",
      locationAccessError: "Location access denied. Using default location.",
      searchingLocation: "Detecting your location..."
    },
    ur: {
      welcome: "اسمارٹ کسان میں خوش آمدید",
      subtitle: "آپ کا AI کاشتکاری معاون",
      getWeeklyAdvice: "ہفتہ وار مشورہ حاصل کریں",
      viewAnalytics: "تجزیات دیکھیں",
      settings: "ترتیبات",
      currentWeather: "موجودہ موسم",
      temperature: "درجہ حرارت",
      humidity: "نمی",
      rainfall: "بارش",
      soilMoisture: "مٹی کی نمی",
      windSpeed: "ہوا کی رفتار",
      sevenDayForecast: "سات دن کی پیشین گوئی",
      aiAdvice: "AI مشورہ",
      viewDetailedAdvice: "تفصیلی مشورہ دیکھیں",
      cropCondition: "فصل کی حالت",
      cropType: "فصل کی قسم",
      growthStage: "بڑھوتری کا مرحلہ",
      healthStatus: "صحت کی حالت",
      irrigationNeed: "آبپاشی کی ضرورت",
      condition: "حالت",
      good: "اچھی",
      vegetative: "نشوونما",
      medium: "درمیانی",
      chatWithAI: "AI سے بات کریں",
      aiAdviceText: "موجودہ موسم کے لحاظ سے، یہ آبپاشی کا بہترین وقت ہے۔ اگلے 48 گھنٹوں میں اپنی گندم کی فصل کو پانی دیں تاکہ زیادہ سے زیادہ پیداوار حاصل ہو سکے۔",
      loadingWeather: "موسمیاتی ڈیٹا لوڈ ہو رہا ہے...",
      loadingForecast: "پیشین گوئی لوڈ ہو رہی ہے...",
      weatherError: "موسمیاتی ڈیٹا عارضی طور پر دستیاب نہیں",
      searchPlaceholder: "شہر تلاش کریں...",
      currentLocation: "موجودہ مقام",
      popularCities: "مشہور شہر",
      detectLocation: "میرا مقام پتہ لگائیں",
      locationAccessError: "مقام تک رسائی سے انکار۔ ڈیفالٹ مقام استعمال ہو رہا ہے۔",
      searchingLocation: "آپ کا مقام دریافت کیا جا رہا ہے..."
    }
  };

  const t = translations[currentLanguage];

  // Filter cities based on search query
  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Real API call to weather endpoint
  const fetchWeatherData = async (lat, lng, cityName = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`);
      const result = await response.json();
      
      if (result.success) {
        setWeatherData(result.data.current);
        setForecastData(result.data.forecast);
        if (cityName) {
          setLocation({ name: cityName, lat, lng });
        }
      } else {
        setWeatherData(result.data.current);
        setForecastData(result.data.forecast);
        setError(t.weatherError);
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      setError(t.weatherError);
      setWeatherData({
        temperature: 28,
        humidity: 65,
        rainfall: 12,
        soilMoisture: 45,
        windSpeed: 15,
        condition: 'Partly Cloudy'
      });
      setForecastData([
        { day: 'Mon', temp: 28, rain: 10, icon: 'sun' },
        { day: 'Tue', temp: 29, rain: 5, icon: 'sun' },
        { day: 'Wed', temp: 27, rain: 15, icon: 'cloud-rain' },
        { day: 'Thu', temp: 26, rain: 20, icon: 'cloud-rain' },
        { day: 'Fri', temp: 25, rain: 8, icon: 'cloud' },
        { day: 'Sat', temp: 27, rain: 12, icon: 'cloud' },
        { day: 'Sun', temp: 29, rain: 3, icon: 'sun' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Detect user's current location
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(t.searchingLocation);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude, t.currentLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError(t.locationAccessError);
        setLoading(false);
      }
    );
  };

  // Initial load
  useEffect(() => {
    fetchWeatherData(location.lat, location.lng);
  }, []);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />;
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return <Cloud className="w-6 h-6 text-gray-500" />;
    } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className="w-6 h-6 text-amber-500" />;
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return <Cloud className="w-6 h-6 text-gray-400" />;
    } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
      return <CloudRain className="w-6 h-6 text-blue-300" />;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return <CloudRain className="w-6 h-6 text-purple-500" />;
    } else {
      return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  const handleCitySelect = (city) => {
    fetchWeatherData(city.lat, city.lng, city.name);
    setShowLocationDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Greeting Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">🌾</span>
            <h1 className="text-4xl font-bold text-green-800">
              {t.welcome}
            </h1>
          </div>
          <p className="text-green-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Location Selector */}
        <div className="mb-8 max-w-md mx-auto relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Location Dropdown */}
              {showLocationDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {/* Current Location Button */}
                  <button
                    onClick={detectUserLocation}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center space-x-3 border-b border-gray-100"
                  >
                    <Navigation className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{t.detectLocation}</span>
                  </button>
                  
                  {/* Popular Cities Section */}
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-500 px-2 py-1">{t.popularCities}</p>
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 rounded-lg flex items-center space-x-3"
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{city.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Location Display */}
          {location && (
            <div className="mt-3 flex items-center justify-center space-x-2 text-green-700">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{location.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/advice" className="block w-full">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
              <Brain className="w-5 h-5" />
              <span className="font-medium">{t.getWeeklyAdvice}</span>
            </button>
          </Link>

          <Link href="/analytics" className="block w-full">
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">{t.viewAnalytics}</span>
            </button>
          </Link>

          <Link href="/settings" className="block w-full">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">{t.settings}</span>
            </button>
          </Link>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weather & Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Weather Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-green-800 flex items-center">
                  <Thermometer className="w-6 h-6 mr-3 text-amber-500" />
                  {t.currentWeather}
                </h2>
                {location && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <MapPin className="w-4 h-4" />
                    <span>{location.name}</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-green-600 mt-2">{t.loadingWeather}</p>
                </div>
              ) : weatherData ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <Sun className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm text-green-600 mb-1">{t.temperature}</p>
                    <p className="text-xl font-bold text-green-800">{weatherData.temperature}°C</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-green-600 mb-1">{t.humidity}</p>
                    <p className="text-xl font-bold text-green-800">{weatherData.humidity}%</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <CloudRain className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-green-600 mb-1">{t.rainfall}</p>
                    <p className="text-xl font-bold text-green-800">{weatherData.rainfall}mm</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <Sprout className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-green-600 mb-1">{t.soilMoisture}</p>
                    <p className="text-xl font-bold text-green-800">{weatherData.soilMoisture}%</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <Wind className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-green-600 mb-1">{t.windSpeed}</p>
                    <p className="text-xl font-bold text-green-800">{weatherData.windSpeed} km/h</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-green-600 mt-2">{t.loadingWeather}</p>
                </div>
              )}
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white rounded-2xl shadow-lg p-6 bid border-green-100">
              <h2 className="text-2xl font-semibold text-green-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                {t.sevenDayForecast}
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-green-600 mt-2">{t.loadingForecast}</p>
                </div>
              ) : forecastData ? (
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                  {forecastData.map((day, index) => (
                    <div key={index} className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="font-semibold text-green-800 mb-2">{day.day}</p>
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(day.icon || day.condition)}
                      </div>
                      <p className="text-amber-600 font-bold text-lg">{day.temp}°C</p>
                      <p className="text-blue-600 text-sm">{day.rain}mm</p>
                      {day.rainProbability > 0 && (
                        <p className="text-blue-400 text-xs mt-1">{day.rainProbability}% chance</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-green-600 mt-2">{t.loadingForecast}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI Advice & Crop Condition */}
          <div className="space-y-6">
            {/* AI Advice Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-purple-500" />
                {t.aiAdvice}
              </h2>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-green-800 leading-relaxed text-sm">
                  {t.aiAdviceText}
                </p>
              </div>
              <Link href="/chat">
                <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors duration-300 font-medium">
                  {t.viewDetailedAdvice}
                </button>
              </Link>
            </div>

            {/* Crop Condition Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                <Sprout className="w-6 h-6 mr-3 text-green-500" />
                {t.cropCondition}
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">{t.cropType}:</span>
                  <span className="font-semibold text-green-800">Wheat</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">{t.growthStage}:</span>
                  <span className="font-semibold text-green-800">{t.vegetative}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">{t.healthStatus}:</span>
                  <span className="font-semibold text-green-800">{t.good}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-amber-700 font-medium">{t.irrigationNeed}:</span>
                  <span className="font-semibold text-amber-600">{t.medium}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showLocationDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowLocationDropdown(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;