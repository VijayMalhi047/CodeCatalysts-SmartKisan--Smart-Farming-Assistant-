// pages/api/weather.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    const { 
      latitude = '31.5204', 
      longitude = '74.3587',
      days = 7 
    } = req.query;

    console.log('Fetching weather data for:', { latitude, longitude, days });

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Please provide valid latitude and longitude values'
      });
    }

    // Open-Meteo API call for current weather
    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=${days}`;
    
    console.log('Calling Open-Meteo API:', currentWeatherUrl);
    
    const response = await fetch(currentWeatherUrl);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.current || !data.daily) {
      throw new Error('Invalid response format from weather API');
    }

    // Transform the data into our application format
    const transformedData = {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        rainfall: data.current.precipitation,
        windSpeed: Math.round(data.current.wind_speed_10m),
        condition: getWeatherCondition(data.current.weather_code),
        weatherCode: data.current.weather_code
      },
      forecast: data.daily.time.map((date, index) => ({
        date: date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        rain: Math.round(data.daily.precipitation_sum[index] * 10) / 10, // 1 decimal place
        rainProbability: data.daily.precipitation_probability_max[index],
        condition: getWeatherCondition(data.daily.weather_code[index]),
        weatherCode: data.daily.weather_code[index]
      })),
      location: {
        latitude: lat,
        longitude: lng
      },
      lastUpdated: new Date().toISOString()
    };

    console.log('Weather data transformed successfully');
    
    // Set cache headers (5 minutes)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    res.status(200).json({
      success: true,
      data: transformedData,
      source: 'open-meteo'
    });

  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data as fallback
    const mockData = getMockWeatherData();
    
    res.status(200).json({
      success: false,
      error: error.message,
      data: mockData,
      source: 'mock-fallback',
      note: 'Using mock data due to API failure'
    });
  }
}

// Weather code mapping based on Open-Meteo documentation
function getWeatherCondition(weatherCode) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle', 
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return conditions[weatherCode] || 'Unknown';
}

// Mock data for fallback when API fails
function getMockWeatherData() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    return {
      date: date.toISOString().split('T')[0],
      day: days[date.getDay()],
      temp: 28 + Math.floor(Math.random() * 5) - 2,
      minTemp: 18 + Math.floor(Math.random() * 5) - 2,
      rain: Math.floor(Math.random() * 20),
      rainProbability: Math.floor(Math.random() * 50),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
      weatherCode: Math.floor(Math.random() * 10)
    };
  });

  return {
    current: {
      temperature: 28,
      humidity: 65,
      rainfall: 12,
      windSpeed: 15,
      condition: 'Partly Cloudy',
      weatherCode: 2
    },
    forecast: forecast,
    location: {
      latitude: 31.5204,
      longitude: 74.3587
    },
    lastUpdated: new Date().toISOString()
  };
}

// Optional: Add support for historical weather data from your JSON files
function getHistoricalContext(region) {
  // This can be enhanced to provide historical comparisons
  // using your historical_weather.json data
  return {
    averageTemperature: 26.5,
    averageRainfall: 45.2,
    trend: 'normal'
  };
}