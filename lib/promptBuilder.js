import { DataAnalyzer } from './dataLoader.js';

export class PromptBuilder {
  static buildAnalysisPrompt(userMessage, region = 'punjab', crop = null) {
    // Get comprehensive data analysis
    const weatherTrends = DataAnalyzer.analyzeWeatherTrends(region);
    const soilAnalysis = DataAnalyzer.getSoilAnalysis(region);
    
    let cropAnalysis = null;
    let prediction = null;
    
    if (crop) {
      cropAnalysis = DataAnalyzer.getCropPerformance(crop, region);
      prediction = DataAnalyzer.predictOptimalSowingTime(crop, region);
    }

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en', { month: 'long' });

    return {
      system: `You are SmartKisan AI, an expert agricultural advisor with knowledge of Pakistani farming conditions.

AGRICULTURAL KNOWLEDGE BASE:
- Regional climate patterns across Pakistan
- Soil types and nutrient requirements
- Crop cycles and optimal timing
- Pest and disease management
- Water management strategies
- Yield optimization techniques

RESPONSE APPROACH:
1. Provide practical, actionable advice
2. Consider regional variations
3. Suggest specific timing based on seasons
4. Recommend appropriate varieties
5. Address any mentioned challenges

CURRENT ANALYSIS:
${this.formatHistoricalData(weatherTrends, cropAnalysis, soilAnalysis)}

Respond in a helpful, conversational manner.`,

      user: userMessage
    };
  }

  static formatHistoricalData(weatherTrends, cropAnalysis, soilAnalysis) {
    let analysis = '';

    if (weatherTrends) {
      analysis += `WEATHER PATTERNS:
- Temperature Trend: ${weatherTrends.temperature.trend}
- Rainfall Pattern: ${weatherTrends.rainfall.trend}

`;
    }

    if (cropAnalysis) {
      analysis += `CROP PERFORMANCE:
- Average Yield: ${cropAnalysis.average_yield} quintals/acre
- Performance Trend: ${cropAnalysis.trend}
- Quality History: ${this.getQualityPattern(cropAnalysis.data_points)}

`;
    }

    if (soilAnalysis) {
      analysis += `SOIL CONDITIONS:
- Soil Types: ${soilAnalysis.soil_types.join(', ')}
- pH Level: ${soilAnalysis.ph_range.min}-${soilAnalysis.ph_range.max}
- Nutrient Status: Nitrogen (${soilAnalysis.nutrient_levels.nitrogen.level}), Phosphorus (${soilAnalysis.nutrient_levels.phosphorus.level}), Potassium (${soilAnalysis.nutrient_levels.potassium.level})

`;
    }

    return analysis || 'General agricultural knowledge available.';
  }

  static getQualityPattern(performanceData) {
    const qualities = performanceData.map(p => p.quality);
    const excellent = qualities.filter(q => q === 'excellent').length;
    const good = qualities.filter(q => q === 'good').length;
    
    if (excellent > good) return 'Mostly Excellent';
    if (good > excellent) return 'Mostly Good';
    return 'Variable Performance';
  }

  static extractCropAndRegion(message) {
    const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize'];
    const regions = ['punjab', 'sindh', 'khyber', 'balochistan'];
    
    const lowerMessage = message.toLowerCase();
    
    let detectedCrop = null;
    let detectedRegion = 'punjab';
    
    for (const crop of crops) {
      if (lowerMessage.includes(crop)) {
        detectedCrop = crop;
        break;
      }
    }
    
    for (const region of regions) {
      if (lowerMessage.includes(region)) {
        detectedRegion = region;
        break;
      }
    }
    
    return { crop: detectedCrop, region: detectedRegion };
  }
}