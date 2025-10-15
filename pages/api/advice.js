// pages/api/advice.js
import { DataAnalyzer } from '../../lib/dataLoader.js';


export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { 
      cropType = 'wheat', 
      region = 'punjab', 
      language = 'en',
      specificQuestion = '',
      coordinates = null // { lat, lng }
    } = req.body;

    console.log('Generating AI advice with real-time weather for:', { 
      cropType, 
      region, 
      language,
      coordinates 
    });

    // Step 1: Get REAL-TIME weather data first
    const realTimeWeather = await getRealTimeWeather(coordinates, region);
    
    // Step 2: Get historical data analysis
    const weatherTrends = DataAnalyzer.analyzeWeatherTrends(region);
    const soilAnalysis = DataAnalyzer.getSoilAnalysis(region);
    const cropPerformance = DataAnalyzer.getCropPerformance(cropType, region);
    const optimalSowing = DataAnalyzer.predictOptimalSowingTime(cropType, region);

    // Step 3: Build dynamic prompt with REAL weather data
    const prompt = buildDynamicAdvicePrompt(
      cropType, 
      region, 
      language, 
      realTimeWeather, // Using REAL data now
      weatherTrends, 
      soilAnalysis, 
      cropPerformance, 
      optimalSowing,
      specificQuestion
    );

    // Step 4: Call AI API
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log('OpenRouter API key not set, returning dynamic mock advice');
      const dynamicAdvice = generateDynamicAdvice(
        cropType, region, language, realTimeWeather, weatherTrends, soilAnalysis
      );
      return res.status(200).json({
        success: true,
        advice: dynamicAdvice,
        source: 'dynamic-mock-data',
        timestamp: new Date().toISOString(),
        weather_used: true,
        data_sources: {
          real_time_weather: true,
          historical_trends: !!weatherTrends,
          soil_analysis: !!soilAnalysis,
          crop_performance: !!cropPerformance
        }
      });
    }

    console.log('Calling OpenRouter API with real-time weather context');

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartKisan AI Advice'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: prompt.system
          },
          {
            role: 'user',
            content: prompt.user
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API returned ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponse = data.choices[0].message.content;
      
      const structuredAdvice = parseStructuredResponse(aiResponse, language);
      
      res.status(200).json({
        success: true,
        advice: structuredAdvice,
        source: 'openrouter-mistral-7b',
        timestamp: new Date().toISOString(),
        weather_used: true,
        current_weather: {
          temperature: realTimeWeather.current?.temperature,
          rainfall: realTimeWeather.current?.rainfall,
          condition: realTimeWeather.current?.condition
        },
        data_sources: {
          real_time_weather: true,
          historical_trends: !!weatherTrends,
          soil_analysis: !!soilAnalysis,
          crop_performance: !!cropPerformance
        }
      });
    } else {
      throw new Error('Invalid response structure from AI API');
    }

  } catch (error) {
    console.error('Advice API error:', error);
    
    // Fallback with whatever data we can get
    const fallbackAdvice = await generateDynamicFallbackAdvice(req.body);
    
    res.status(500).json({
      error: error.message || 'Failed to generate AI advice',
      advice: fallbackAdvice,
      source: 'dynamic-fallback',
      timestamp: new Date().toISOString(),
      weather_used: false
    });
  }
}

// Get REAL-TIME weather data from our weather API
async function getRealTimeWeather(coordinates, region) {
  try {
    let weatherUrl = '/api/weather';
    
    // Use coordinates if provided, otherwise use region-based default
    if (coordinates && coordinates.lat && coordinates.lng) {
      weatherUrl += `?latitude=${coordinates.lat}&longitude=${coordinates.lng}`;
    } else {
      // Use region-based coordinates
      const regionCoords = getRegionCoordinates(region);
      weatherUrl += `?latitude=${regionCoords.lat}&longitude=${regionCoords.lng}`;
    }

    console.log('Fetching real-time weather from:', weatherUrl);
    
    const response = await fetch(`http://localhost:3000${weatherUrl}`);
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Real-time weather data obtained:', {
        temp: result.data.current.temperature,
        rain: result.data.current.rainfall,
        condition: result.data.current.condition
      });
      return result.data;
    } else {
      throw new Error('Weather API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Failed to get real-time weather:', error);
    // Return mock weather data as fallback
    return getMockWeatherData(region);
  }
}

// Build dynamic prompt with REAL weather data
function buildDynamicAdvicePrompt(cropType, region, language, realTimeWeather, weatherTrends, soilAnalysis, cropPerformance, optimalSowing, specificQuestion) {
  const isEnglish = language === 'en';
  const current = realTimeWeather.current;
  const forecast = realTimeWeather.forecast;
  
  const systemPrompt = `You are SmartKisan AI, an expert agricultural advisor specializing in Pakistani farming conditions. Provide REAL-TIME, weather-aware farming advice.

CRITICAL WEATHER CONTEXT - USE THIS FOR ALL RECOMMENDATIONS:
${formatRealTimeWeatherContext(current, forecast, isEnglish)}

RESPONSE FORMAT REQUIREMENTS:
You MUST return your response in this exact JSON format:
{
  "irrigation": {
    "recommendation": "specific advice based on CURRENT rainfall and temperature",
    "schedule": "adjust based on upcoming forecast",
    "water_amount": "adjust based on recent rainfall", 
    "urgency": "high/medium/low based on conditions"
  },
  "fertilizer": {
    "recommendation": "advice considering CURRENT soil moisture and temperature",
    "type": "fertilizer types suitable for current weather",
    "quantity": "amount per acre",
    "timing": "when to apply considering weather forecast"
  },
  "pest_control": {
    "recommendation": "pest risks based on CURRENT humidity and temperature",
    "common_pests": "pests likely in current conditions",
    "organic_options": "natural remedies",
    "chemical_options": "if necessary"
  },
  "sowing_harvest": {
    "optimal_timing": "adjust based on CURRENT conditions vs historical",
    "preparation": "field preparation considering current weather",
    "harvest_window": "when to harvest",
    "yield_expectation": "expected yield given current conditions"
  },
  "weather_alerts": {
    "current_risks": "immediate weather risks to crops",
    "precautions": "protective measures needed NOW",
    "timeline": "when to expect issues based on forecast"
  },
  "summary": "brief overall summary focusing on CURRENT situation",
  "confidence": "high/medium/low"
}

KEY GUIDELINES FOR REAL-TIME ADVICE:
- Base ALL recommendations on CURRENT weather conditions
- Adjust irrigation based on RECENT rainfall and FORECAST
- Consider temperature impact on fertilizer effectiveness  
- Account for humidity in pest/disease risk assessment
- Suggest immediate actions for current weather risks
- Compare current conditions to historical averages
- Provide time-sensitive recommendations

ADDITIONAL CONTEXT:
${formatHistoricalContext(cropType, region, weatherTrends, soilAnalysis, cropPerformance, optimalSowing, isEnglish)}

${specificQuestion ? `USER'S SPECIFIC QUESTION: ${specificQuestion}` : ''}`;

  const userPrompt = isEnglish 
    ? `Generate REAL-TIME farming advice for ${cropType} in ${region} considering the current weather conditions shown above. Focus on immediate actions and adjustments needed based on actual weather.`
    : `مندرجہ بالا موجودہ موسمی حالات کو مدنظر رکھتے ہوئے ${region} میں ${getUrduCropName(cropType)} کے لیے رئیل ٹائم کاشتکاری کا مشورہ دیں۔ اصل موسم کی بنیاد پر فوری اقدامات اور ایڈجسٹمنٹ پر توجہ مرکوز کریں۔`;

  return { system: systemPrompt, user: userPrompt };
}

// Format REAL-TIME weather context for the prompt
function formatRealTimeWeatherContext(current, forecast, isEnglish) {
  if (!current) return 'WEATHER DATA UNAVAILABLE - Using general recommendations';

  let context = 'CURRENT WEATHER CONDITIONS (REAL-TIME):\n';
  context += `- Temperature: ${current.temperature}°C\n`;
  context += `- Rainfall: ${current.rainfall}mm\n`;
  context += `- Humidity: ${current.humidity}%\n`;
  context += `- Wind Speed: ${current.windSpeed} km/h\n`;
  context += `- Condition: ${current.condition}\n\n`;

  context += '7-DAY WEATHER FORECAST:\n';
  if (forecast && forecast.length > 0) {
    forecast.slice(0, 3).forEach(day => {
      context += `- ${day.day}: ${day.temp}°C, ${day.rain}mm rain, ${day.rainProbability}% rain chance\n`;
    });
    if (forecast.length > 3) {
      context += `- ... and ${forecast.length - 3} more days\n`;
    }
  }

  // Add weather impact analysis
  context += '\nIMMEDIATE WEATHER IMPACT ANALYSIS:\n';
  
  // Temperature impact
  if (current.temperature > 35) {
    context += '- HIGH TEMPERATURE ALERT: Risk of heat stress on crops\n';
  } else if (current.temperature < 10) {
    context += '- LOW TEMPERATURE ALERT: Risk of cold stress on crops\n';
  } else {
    context += '- Temperature within optimal range for most crops\n';
  }

  // Rainfall impact
  if (current.rainfall > 20) {
    context += '- HEAVY RAINFALL: Reduce irrigation, monitor for waterlogging\n';
  } else if (current.rainfall > 5) {
    context += '- MODERATE RAINFALL: Adjust irrigation schedule\n';
  } else if (current.rainfall === 0) {
    context += '- NO RECENT RAIN: Irrigation needed, check soil moisture\n';
  }

  // Humidity impact
  if (current.humidity > 80) {
    context += '- HIGH HUMIDITY: Increased fungal disease risk\n';
  } else if (current.humidity < 40) {
    context += '- LOW HUMIDITY: Increased irrigation needs\n';
  }

  return context;
}

// Format historical context
function formatHistoricalContext(cropType, region, weatherTrends, soilAnalysis, cropPerformance, optimalSowing, isEnglish) {
  let context = 'HISTORICAL CONTEXT (For Comparison):\n';

  if (weatherTrends) {
    context += `- Temperature Trend: ${weatherTrends.temperature.trend}\n`;
    context += `- Rainfall Trend: ${weatherTrends.rainfall.trend}\n`;
  }

  if (soilAnalysis) {
    context += `- Soil Type: ${soilAnalysis.soil_types[0]}\n`;
    context += `- Nutrient Levels: N-${soilAnalysis.nutrient_levels.nitrogen.level}, P-${soilAnalysis.nutrient_levels.phosphorus.level}, K-${soilAnalysis.nutrient_levels.potassium.level}\n`;
  }

  if (cropPerformance) {
    context += `- Avg Yield: ${cropPerformance.average_yield} q/acre\n`;
    context += `- Performance: ${cropPerformance.trend}\n`;
  }

  return context;
}

// Generate dynamic advice based on real weather
function generateDynamicAdvice(cropType, region, language, realTimeWeather, weatherTrends, soilAnalysis) {
  const isEnglish = language === 'en';
  const current = realTimeWeather.current;
  
  // Dynamic logic based on actual weather
  const irrigationUrgency = getIrrigationUrgency(current);
  const pestRisk = getPestRisk(current);
  const fertilizerTiming = getFertilizerTiming(current, forecast);

  return {
    irrigation: {
      recommendation: getIrrigationAdvice(current, forecast, isEnglish),
      schedule: getIrrigationSchedule(current, forecast, isEnglish),
      water_amount: getWaterAmount(current, isEnglish),
      urgency: irrigationUrgency
    },
    fertilizer: {
      recommendation: getFertilizerAdvice(current, soilAnalysis, isEnglish),
      type: "NPK 50:25:25",
      quantity: "50kg/acre",
      timing: fertilizerTiming
    },
    pest_control: {
      recommendation: getPestControlAdvice(current, pestRisk, isEnglish),
      common_pests: getCommonPests(current, cropType, isEnglish),
      organic_options: "Neem oil, Garlic spray",
      chemical_options: isEnglish ? "Use only if infestation severe" : "صرف شدید انفیکشن کی صورت میں استعمال کریں"
    },
    sowing_harvest: {
      optimal_timing: getOptimalTiming(current, cropType, isEnglish),
      preparation: getFieldPreparation(current, isEnglish),
      harvest_window: "Apr-May",
      yield_expectation: getYieldExpectation(current, cropType, isEnglish)
    },
    weather_alerts: {
      current_risks: getCurrentRisks(current, isEnglish),
      precautions: getPrecautions(current, isEnglish),
      timeline: getRiskTimeline(forecast, isEnglish)
    },
    summary: getDynamicSummary(current, cropType, region, isEnglish),
    confidence: "high"
  };
}

// Dynamic helper functions based on real weather
function getIrrigationUrgency(current) {
  if (current.rainfall > 15) return "low";
  if (current.rainfall > 5) return "medium"; 
  if (current.temperature > 30) return "high";
  return "medium";
}

function getPestRisk(current) {
  if (current.humidity > 75 && current.temperature > 25) return "high";
  if (current.humidity > 65) return "medium";
  return "low";
}

function getIrrigationAdvice(current, forecast, isEnglish) {
  if (current.rainfall > 20) {
    return isEnglish 
      ? "Recent heavy rainfall detected. Skip next irrigation to prevent waterlogging."
      : "حالیہ شدید بارش کا پتہ چلا ہے۔ پانی کے کھڑے ہونے سے روکنے کے لیے اگلی آبپاشی چھوڑ دیں۔";
  } else if (current.rainfall > 5) {
    return isEnglish
      ? "Moderate rainfall received. Reduce irrigation frequency and monitor soil moisture."
      : "معتدل بارش ہوئی ہے۔ آبپاشی کی فریکوئنسی کم کریں اور مٹی کی نمی پر نظر رکھیں۔";
  } else if (current.temperature > 32) {
    return isEnglish
      ? "High temperatures increasing water demand. Maintain regular irrigation schedule."
      : "زیادہ درجہ حرارت پانی کی مانگ بڑھا رہا ہے۔ باقاعدہ آبپاشی کا شیڈول برقرار رکھیں۔";
  } else {
    return isEnglish
      ? "Normal conditions. Continue with standard irrigation practices."
      : "عام حالات۔ معیاری آبپاشی کے طریقوں کو جاری رکھیں۔";
  }
}

// ... Add more dynamic helper functions for other categories

// Region coordinates for weather API
function getRegionCoordinates(region) {
  const coordinates = {
    punjab: { lat: '31.5204', lng: '74.3587' }, // Lahore
    sindh: { lat: '24.8607', lng: '67.0011' }, // Karachi
    khyber: { lat: '34.0151', lng: '71.5249' }, // Peshawar
    balochistan: { lat: '30.1798', lng: '66.9750' } // Quetta
  };
  return coordinates[region] || coordinates.punjab;
}

// Keep the existing helper functions (getUrduCropName, parseStructuredResponse, etc.)
// ... [Previous helper functions remain the same]

async function generateDynamicFallbackAdvice(requestBody) {
  // Try to get at least some weather data for fallback
  let realTimeWeather;
  try {
    realTimeWeather = await getRealTimeWeather(
      requestBody?.coordinates, 
      requestBody?.region
    );
  } catch (error) {
    realTimeWeather = getMockWeatherData(requestBody?.region);
  }
  
  return generateDynamicAdvice(
    requestBody?.cropType || 'wheat',
    requestBody?.region || 'punjab', 
    requestBody?.language || 'en',
    realTimeWeather,
    null, null
  );
}

// Mock weather data fallback
function getMockWeatherData(region) {
  return {
    current: {
      temperature: 28,
      humidity: 65,
      rainfall: 12,
      windSpeed: 15,
      condition: 'Partly Cloudy',
      soilMoisture: 45
    },
    forecast: [
      { day: 'Mon', temp: 28, rain: 10, rainProbability: 30 },
      { day: 'Tue', temp: 29, rain: 5, rainProbability: 20 },
      { day: 'Wed', temp: 27, rain: 15, rainProbability: 40 }
    ]
  };
}