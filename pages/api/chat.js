// pages/api/chat.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  try {
    const { message, conversationHistory = [], language = 'en', userRegion = 'punjab' } = req.body;

    console.log('Received chat request:', { 
      message, 
      language,
      userRegion,
      historyLength: conversationHistory.length 
    });

    // Step 1: Get current weather data for the user's region
    const weatherData = await getCurrentWeatherData(userRegion);
    console.log('Weather data obtained:', weatherData ? 'Yes' : 'No');

    // Extract context from conversation
    const context = extractConversationContext(conversationHistory, message);
    
    // Build intelligent, conversational prompt with weather data
    const prompt = buildConversationalPrompt(message, context, language, weatherData);
    
    console.log('Context extracted:', context);

    // Get API key from environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log('OpenRouter API key not set');
      const mockResponse = generateFallbackResponse(message, context, language, weatherData);
      return res.status(200).json({
        response: mockResponse,
        timestamp: new Date().toISOString(),
        note: "Please set OPENROUTER_API_KEY in .env.local",
        context: context,
        weather_used: !!weatherData
      });
    }

    console.log('Using OpenRouter API with Mistral 7B');

    // Real API call to OpenRouter with Mistral 7B
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
        'X-Title': 'SmartKisan AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Free and excellent for agriculture
        messages: [
          {
            role: 'system',
            content: prompt.system
          },
          ...conversationHistory,
          {
            role: 'user',
            content: prompt.user
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 0.9,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API returned ${openRouterResponse.status}: ${errorText}`);
    }

    const data = await openRouterResponse.json();
    console.log('OpenRouter API success:', data.choices ? 'Has choices' : 'No choices');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      let responseText = data.choices[0].message.content;
      
      // Clean and enhance the response formatting
      responseText = enhanceAIFormatting(responseText, language);
      
      res.status(200).json({
        response: responseText,
        timestamp: new Date().toISOString(),
        source: 'openrouter-mistral-7b',
        context: context,
        weather_used: !!weatherData,
        current_weather: weatherData
      });
    } else {
      console.error('Invalid OpenRouter response structure:', data);
      throw new Error('Invalid response structure from OpenRouter API');
    }
  } catch (error) {
    console.error('Chat API error:', error);
    const context = extractConversationContext(req.body?.conversationHistory, req.body?.message);
    const weatherData = await getCurrentWeatherData(req.body?.userRegion || 'punjab');
    const fallback = generateFallbackResponse(req.body?.message, context, req.body?.language, weatherData);
    res.status(500).json({ 
      error: error.message || 'Failed to get AI response',
      fallback: fallback,
      timestamp: new Date().toISOString(),
      context: context,
      weather_used: !!weatherData
    });
  }
}

// Get current weather data from our weather API
async function getCurrentWeatherData(region) {
  try {
    const regionCoords = getRegionCoordinates(region);
    const response = await fetch(`http://localhost:3000/api/weather?latitude=${regionCoords.lat}&longitude=${regionCoords.lng}`);
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        temperature: result.data.current.temperature,
        humidity: result.data.current.humidity,
        rainfall: result.data.current.rainfall,
        windSpeed: result.data.current.windSpeed,
        condition: result.data.current.condition,
        region: region
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get weather data:', error);
    return null;
  }
}

// Region coordinates mapping
function getRegionCoordinates(region) {
  const coordinates = {
    punjab: { lat: '31.5204', lng: '74.3587' },
    sindh: { lat: '24.8607', lng: '67.0011' },
    khyber: { lat: '34.0151', lng: '71.5249' },
    balochistan: { lat: '30.1798', lng: '66.9750' },
    'khyber pakhtunkhwa': { lat: '34.0151', lng: '71.5249' }
  };
  return coordinates[region.toLowerCase()] || coordinates.punjab;
}

// Extract context from conversation history
function extractConversationContext(conversationHistory, currentMessage) {
  const context = {
    crop: null,
    region: null,
    growthStage: null,
    challenges: [],
    userPreferences: {},
    conversationTone: 'friendly',
    soilType: null,
    irrigationType: null
  };

  // Analyze conversation history for context
  const fullConversation = [...conversationHistory, { role: 'user', content: currentMessage }];
  
  fullConversation.forEach((msg, index) => {
    const content = msg.content.toLowerCase();
    
    // Detect crop
    if (content.includes('wheat') || content.includes('گندم')) context.crop = 'wheat';
    if (content.includes('rice') || content.includes('چاول')) context.crop = 'rice';
    if (content.includes('cotton') || content.includes('کپاس')) context.crop = 'cotton';
    if (content.includes('sugarcane') || content.includes('گنا')) context.crop = 'sugarcane';
    if (content.includes('maize') || content.includes('مکئی')) context.crop = 'maize';
    
    // Detect region
    if (content.includes('punjab') || content.includes('پنجاب')) context.region = 'punjab';
    if (content.includes('sindh') || content.includes('سندھ')) context.region = 'sindh';
    if (content.includes('khyber') || content.includes('خیبر')) context.region = 'khyber pakhtunkhwa';
    if (content.includes('balochistan') || content.includes('بلوچستان')) context.region = 'balochistan';
    
    // Detect growth stage
    if (content.includes('sowing') || content.includes('بوائی') || content.includes('planting')) context.growthStage = 'sowing';
    if (content.includes('vegetative') || content.includes('نشوونما')) context.growthStage = 'vegetative';
    if (content.includes('flowering') || content.includes('پھول')) context.growthStage = 'flowering';
    if (content.includes('harvest') || content.includes('کٹائی')) context.growthStage = 'harvest';
    if (content.includes('idk') || content.includes('not sure') || content.includes('پتہ نہیں')) context.growthStage = 'unknown';
    
    // Detect soil type
    if (content.includes('sandy') || content.includes('ریتیلی')) context.soilType = 'sandy';
    if (content.includes('clay') || content.includes('چکنی')) context.soilType = 'clay';
    if (content.includes('loam') || content.includes('بھاری')) context.soilType = 'loam';
    
    // Detect irrigation
    if (content.includes('canal') || content.includes('نہر')) context.irrigationType = 'canal';
    if (content.includes('tube well') || content.includes('ٹیوب ویل')) context.irrigationType = 'tube well';
    if (content.includes('rain') || content.includes('بارش')) context.irrigationType = 'rainfed';
    
    // Detect challenges
    if (content.includes('pest') || content.includes('کیڑے') || content.includes('insect')) context.challenges.push('pests');
    if (content.includes('disease') || content.includes('بیماری')) context.challenges.push('diseases');
    if (content.includes('water') || content.includes('پانی') || content.includes('irrigation')) context.challenges.push('irrigation');
    if (content.includes('soil') || content.includes('مٹی') || content.includes('fertili')) context.challenges.push('soil_health');
    if (content.includes('weather') || content.includes('موسم')) context.challenges.push('weather');
    if (content.includes('no challenge') || content.includes('کوئی مسئلہ نہیں')) context.challenges = ['none'];
    
    // Detect tone and preferences
    if (content.includes('bro') || content.includes('بھائی') || content.includes('dude')) context.conversationTone = 'casual';
    if (content.includes('hello') || content.includes('hi') || content.includes('ہیلو')) context.conversationTone = 'friendly';
  });

  return context;
}

// Build conversational prompt with weather data
function buildConversationalPrompt(message, context, language, weatherData) {
  const isEnglish = language === 'en';
  
  const systemPrompt = `You are SmartKisan AI - a friendly, conversational farming assistant for Pakistani farmers. You're having a real-time conversation with a farmer.

AGRICULTURAL EXPERTISE:
- You have deep knowledge of Pakistani agriculture, crops, and regional conditions
- You understand soil types, irrigation methods, and crop cycles
- You can predict optimal planting times based on weather patterns
- You provide specific, actionable advice for Pakistani farming conditions
- You consider regional variations in climate and soil

CURRENT WEATHER CONTEXT (USE THIS FOR REAL-TIME ADVICE):
${formatWeatherContext(weatherData, isEnglish)}

CONVERSATION STYLE:
- Be NATURAL and CONVERSATIONAL - talk like a real person, not a robot
- Use emojis occasionally to make it engaging 🌟
- Remember context from previous messages in this conversation
- Ask follow-up questions to understand their situation better
- Provide practical, actionable farming advice
- Show empathy and understanding of their challenges
- Use simple, clear language that farmers can understand
- Be encouraging and supportive
- If they mention crops/regions, use that context in your response
- Never sound like a textbook or manual - be a friendly expert

RESPONSE FORMATTING (IMPORTANT - USE THIS STYLE):
- Use **bold** for important terms and key recommendations
- Use bullet points • for lists and step-by-step advice
- Use emojis to make it engaging 🌱💧🌞
- Structure information clearly with line breaks
- Use conversational markers like "Great question!" or "I understand your concern"
- Include weather-specific advice based on current conditions
- Provide timing recommendations based on seasonal patterns

CURRENT CONTEXT:
${formatContextForPrompt(context, isEnglish)}

DATA-DRIVEN INSIGHTS:
- Use your knowledge of Pakistani agriculture for predictions
- Consider CURRENT WEATHER conditions for immediate advice
- Provide specific timing recommendations based on crop cycles
- Suggest appropriate varieties for their region
- Account for soil types and irrigation methods in your advice

WEATHER-BASED RECOMMENDATIONS:
- Adjust irrigation advice based on recent rainfall
- Consider temperature for pest/disease risks
- Use humidity levels for fungal disease warnings
- Factor in wind conditions for spraying schedules
- Provide immediate actions based on current weather

RESPONSE STYLE:
- Start by naturally acknowledging what they said
- Provide helpful information based on their specific situation AND current weather
- Ask relevant follow-up questions to continue the conversation
- Keep it warm, friendly, and engaging
- Use their name/crop/region if you know it
- Be the farming expert friend they can rely on

Remember: This is a REAL conversation with a Pakistani farmer who needs your help right now! Use the current weather data to give them the most relevant advice possible!`;

  return {
    system: systemPrompt,
    user: message
  };
}

// Format weather context for the prompt
function formatWeatherContext(weatherData, isEnglish) {
  if (!weatherData) {
    return isEnglish ? 
      "Weather data unavailable - use general seasonal advice" :
      "موسمیاتی ڈیٹا دستیاب نہیں - عمومی موسمی مشورے استعمال کریں";
  }

  return isEnglish ?
    `CURRENT WEATHER IN ${weatherData.region.toUpperCase()}:
• Temperature: ${weatherData.temperature}°C
• Humidity: ${weatherData.humidity}%
• Recent Rainfall: ${weatherData.rainfall}mm
• Wind Speed: ${weatherData.windSpeed} km/h
• Condition: ${weatherData.condition}

WEATHER IMPACT ANALYSIS:
${getWeatherImpact(weatherData, true)}` 
    :
    `${weatherData.region.toUpperCase()} میں موجودہ موسم:
• درجہ حرارت: ${weatherData.temperature}°C
• نمی: ${weatherData.humidity}%
• حالیہ بارش: ${weatherData.rainfall} ملی میٹر
• ہوا کی رفتار: ${weatherData.windSpeed} کلومیٹر/گھنٹہ
• حالت: ${weatherData.condition}

موسم کے اثرات کا تجزیہ:
${getWeatherImpact(weatherData, false)}`;
}

// Get weather impact analysis
function getWeatherImpact(weatherData, isEnglish) {
  const impacts = [];
  
  // Temperature impact
  if (weatherData.temperature > 35) {
    impacts.push(isEnglish ? 
      "• HIGH TEMPERATURE: Risk of heat stress on crops, increase irrigation frequency" :
      "• زیادہ درجہ حرارت: فصلوں پر حرارتی دباؤ کا خطرہ، آبپاشی کی فریکوئنسی بڑھائیں");
  } else if (weatherData.temperature < 10) {
    impacts.push(isEnglish ?
      "• LOW TEMPERATURE: Risk of cold stress, protect sensitive crops" :
      "• کم درجہ حرارت: سردی کے دباؤ کا خطرہ، حساس فصلوں کو محفوظ کریں");
  }
  
  // Rainfall impact
  if (weatherData.rainfall > 20) {
    impacts.push(isEnglish ?
      "• HEAVY RAINFALL: Reduce irrigation, monitor for waterlogging and fungal diseases" :
      "• شدید بارش: آبپاشی کم کریں، پانی کے کھڑے ہونے اور fungal بیماریوں کی نگرانی کریں");
  } else if (weatherData.rainfall > 5) {
    impacts.push(isEnglish ?
      "• MODERATE RAINFALL: Adjust irrigation schedule, good for soil moisture" :
      "• معتدل بارش: آبپاشی کا شیڈول ایڈجسٹ کریں، مٹی کی نمی کے لیے اچھا ہے");
  } else if (weatherData.rainfall === 0) {
    impacts.push(isEnglish ?
      "• NO RECENT RAIN: Irrigation needed, check soil moisture regularly" :
      "• حالیہ بارش نہیں: آبپاشی درکار، مٹی کی نمی باقاعدہ چیک کریں");
  }
  
  // Humidity impact
  if (weatherData.humidity > 80) {
    impacts.push(isEnglish ?
      "• HIGH HUMIDITY: Increased risk of fungal diseases, monitor crops closely" :
      "• زیادہ نمی: fungal بیماریوں کا بڑھتا ہوا خطرہ، فصلوں کی قریب سے نگرانی کریں");
  } else if (weatherData.humidity < 40) {
    impacts.push(isEnglish ?
      "• LOW HUMIDITY: Increased irrigation needs, watch for drought stress" :
      "• کم نمی: آبپاشی کی ضروریات میں اضافہ، خشک سالی کے دباؤ پر نظر رکھیں");
  }
  
  return impacts.join('\n') || (isEnglish ? 
    "• Normal weather conditions for this season" : 
    "• اس موسم کے لیے عام موسمی حالات");
}

function formatContextForPrompt(context, isEnglish) {
  let contextText = '';
  
  if (context.crop) {
    contextText += `- Crop: ${context.crop}\n`;
  }
  
  if (context.region) {
    contextText += `- Region: ${context.region}\n`;
  }
  
  if (context.growthStage) {
    const stage = isEnglish ? 
      (context.growthStage === 'sowing' ? 'sowing/planting stage' :
       context.growthStage === 'vegetative' ? 'growth stage' :
       context.growthStage === 'flowering' ? 'flowering stage' :
       context.growthStage === 'harvest' ? 'harvest stage' : 'unknown stage') :
      (context.growthStage === 'sowing' ? 'بوائی کا مرحلہ' :
       context.growthStage === 'vegetative' ? 'نشوونما کا مرحلہ' :
       context.growthStage === 'flowering' ? 'پھول آنے کا مرحلہ' :
       context.growthStage === 'harvest' ? 'کٹائی کا مرحلہ' : 'نامعلوم مرحلہ');
    contextText += `- Growth Stage: ${stage}\n`;
  }

  if (context.soilType) {
    contextText += `- Soil Type: ${context.soilType}\n`;
  }

  if (context.irrigationType) {
    contextText += `- Irrigation: ${context.irrigationType}\n`;
  }
  
  if (context.challenges.length > 0 && !context.challenges.includes('none')) {
    const challenges = isEnglish ? 
      context.challenges.join(', ') :
      context.challenges.map(c => 
        c === 'pests' ? 'کیڑے' :
        c === 'diseases' ? 'بیماریاں' :
        c === 'irrigation' ? 'آبپاشی' :
        c === 'soil_health' ? 'مٹی کی صحت' :
        c === 'weather' ? 'موسم' : c
      ).join(', ');
    contextText += `- Challenges: ${challenges}\n`;
  }
  
  contextText += `- Conversation Style: ${context.conversationTone}`;
  
  return contextText || 'No specific context yet. Start a friendly conversation.';
}

// Enhance AI formatting in responses
function enhanceAIFormatting(responseText, language) {
  const isEnglish = language === 'en';
  
  // Clean any artifacts first
  let cleaned = responseText
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    .replace(/\[INST\]/g, '')
    .replace(/\[\/INST\]/g, '')
    .trim();

  // Ensure proper formatting for lists
  cleaned = cleaned.replace(/\n•/g, '\n•'); // Ensure bullet points
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '**$1**'); // Ensure bold formatting
  
  // Add emojis if missing in key sections
  if (isEnglish) {
    if (cleaned.includes('irrigation') && !cleaned.includes('💧')) {
      cleaned = cleaned.replace(/irrigation/gi, 'irrigation 💧');
    }
    if (cleaned.includes('fertilizer') && !cleaned.includes('🌿')) {
      cleaned = cleaned.replace(/fertilizer/gi, 'fertilizer 🌿');
    }
    if (cleaned.includes('weather') && !cleaned.includes('🌦️')) {
      cleaned = cleaned.replace(/weather/gi, 'weather 🌦️');
    }
  } else {
    if (cleaned.includes('آبپاشی') && !cleaned.includes('💧')) {
      cleaned = cleaned.replace(/آبپاشی/g, 'آبپاشی 💧');
    }
    if (cleaned.includes('کھاد') && !cleaned.includes('🌿')) {
      cleaned = cleaned.replace(/کھاد/g, 'کھاد 🌿');
    }
    if (cleaned.includes('موسم') && !cleaned.includes('🌦️')) {
      cleaned = cleaned.replace(/موسم/g, 'موسم 🌦️');
    }
  }

  return cleaned;
}

// Generate fallback responses with weather context
function generateFallbackResponse(message, context, language, weatherData) {
  const isEnglish = language === 'en';
  
  const weatherContext = weatherData ? 
    (isEnglish ? 
      `\n\nCurrent weather in ${weatherData.region}: ${weatherData.temperature}°C, ${weatherData.condition}, ${weatherData.rainfall}mm rain` :
      `\n\n${weatherData.region} میں موجودہ موسم: ${weatherData.temperature}°C, ${weatherData.condition}, ${weatherData.rainfall} ملی میٹر بارش`) 
    : '';

  return isEnglish ?
    `I'd love to help you with your farming questions! 🌱${weatherContext}\n\nCurrently, I'm experiencing some technical connectivity issues, but I can still share farming knowledge based on general conditions.\n\nFor the best personalized advice with real-time weather data, please make sure the OpenRouter API key is properly configured. In the meantime, feel free to ask me any farming questions! 😊` :
    `میں آپ کے کاشتکاری کے سوالات میں مدد کرنا پسند کروں گا! 🌱${weatherContext}\n\nفی الحال، مجھے کچھ تکنیکی رابطے کے مسائل درپیش ہیں، لیکن میں پھر بھی عمومی حالات کی بنیاد پر کاشتکاری کا علم شیئر کر سکتا ہوں۔\n\nرئیل ٹائم موسمی ڈیٹا کے ساتھ بہترین ذاتی نوعیت کے مشورے کے لیے، براہ کرم یقینی بنائیں کہ OpenRouter API کلید صحیح طریقے سے ترتیب دی گئی ہے۔ اس دوران، مجھے کوئی بھی کاشتکاری کا سوال پوچھنے میں آزاد محسوس کریں! 😊`;
}