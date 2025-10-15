import historicalWeather from '../data/historical_weather.json';
import cropYieldData from '../data/crop_yield_data.json';
import soilData from '../data/soil_data.json';

export class DataAnalyzer {
  static getHistoricalWeather(region, years = 10) {
    const regionData = historicalWeather[region];
    if (!regionData) return null;

    const currentYear = new Date().getFullYear();
    const historical = {};
    
    for (let year = currentYear - years; year < currentYear; year++) {
      if (regionData[year]) {
        historical[year] = regionData[year];
      }
    }
    
    return historical;
  }

  static analyzeWeatherTrends(region) {
    const historical = this.getHistoricalWeather(region, 15);
    if (!historical) return null;

    const trends = {
      temperature: { trend: 'stable', change: 0 },
      rainfall: { trend: 'stable', change: 0 },
      extreme_events: []
    };

    const years = Object.keys(historical).map(Number).sort();
    if (years.length < 2) return trends;

    // Calculate temperature trend
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    
    const firstYearAvg = this.calculateYearlyAverage(historical[firstYear], 'avg_temp');
    const lastYearAvg = this.calculateYearlyAverage(historical[lastYear], 'avg_temp');
    
    trends.temperature.change = parseFloat((lastYearAvg - firstYearAvg).toFixed(2));
    trends.temperature.trend = trends.temperature.change > 0.5 ? 'increasing' : 
                              trends.temperature.change < -0.5 ? 'decreasing' : 'stable';

    // Calculate rainfall trend
    const firstYearRain = this.calculateYearlyTotal(historical[firstYear], 'rainfall');
    const lastYearRain = this.calculateYearlyTotal(historical[lastYear], 'rainfall');
    
    trends.rainfall.change = parseFloat(((lastYearRain - firstYearRain) / firstYearRain * 100).toFixed(1));
    trends.rainfall.trend = trends.rainfall.change > 10 ? 'increasing' : 
                           trends.rainfall.change < -10 ? 'decreasing' : 'stable';

    return trends;
  }

  static getCropPerformance(crop, region) {
    const cropData = cropYieldData[crop]?.[region];
    if (!cropData) return null;

    const years = Object.keys(cropData).map(Number).sort();
    const performances = years.map(year => ({
      year,
      yield: cropData[year].yield_per_acre,
      quality: cropData[year].quality
    }));

    const avgYield = performances.reduce((sum, p) => sum + p.yield, 0) / performances.length;
    const bestYear = performances.reduce((best, current) => 
      current.yield > best.yield ? current : best
    );
    const worstYear = performances.reduce((worst, current) => 
      current.yield < worst.yield ? current : worst
    );

    return {
      average_yield: parseFloat(avgYield.toFixed(1)),
      best_performance: bestYear,
      worst_performance: worstYear,
      trend: performances[performances.length - 1].yield > avgYield ? 'improving' : 'declining',
      data_points: performances
    };
  }

  static getSoilAnalysis(region) {
    return soilData[region] || null;
  }

  static predictOptimalSowingTime(crop, region, currentWeather) {
    const historical = this.getHistoricalWeather(region, 10);
    const cropPerformance = this.getCropPerformance(crop, region);
    
    if (!historical || !cropPerformance) return null;

    // Simple prediction based on historical best performing years
    const bestYears = cropPerformance.data_points
      .filter(p => p.quality === 'excellent')
      .map(p => p.year);

    const bestWeatherPatterns = bestYears.map(year => historical[year]);
    
    // Find optimal temperature range from best years
    const optimalTemps = bestWeatherPatterns.map(pattern => 
      this.calculateMonthlyAverage(pattern, ['march', 'april', 'october', 'november'], 'avg_temp')
    );

    const avgOptimalTemp = optimalTemps.reduce((a, b) => a + b, 0) / optimalTemps.length;

    return {
      crop,
      region,
      optimal_temperature: parseFloat(avgOptimalTemp.toFixed(1)),
      recommended_months: this.getRecommendedMonths(crop),
      confidence: bestYears.length > 3 ? 'high' : 'medium',
      historical_best_years: bestYears.slice(0, 3)
    };
  }

  static calculateYearlyAverage(yearData, metric) {
    const months = Object.values(yearData);
    return months.reduce((sum, month) => sum + month[metric], 0) / months.length;
  }

  static calculateYearlyTotal(yearData, metric) {
    const months = Object.values(yearData);
    return months.reduce((sum, month) => sum + month[metric], 0);
  }

  static calculateMonthlyAverage(yearData, months, metric) {
    const selectedMonths = months.map(month => yearData[month]?.[metric] || 0);
    return selectedMonths.reduce((a, b) => a + b, 0) / selectedMonths.length;
  }

  static getRecommendedMonths(crop) {
    const recommendations = {
      wheat: ['October', 'November', 'December'],
      rice: ['June', 'July'],
      cotton: ['April', 'May', 'June'],
      sugarcane: ['February', 'March', 'September', 'October'],
      maize: ['June', 'July', 'January', 'February']
    };
    return recommendations[crop] || ['Varies by region'];
  }
}