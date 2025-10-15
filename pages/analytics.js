import { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  TrendingUp, 
  Download, 
  Filter, 
  CloudRain, 
  Sprout, 
  Leaf, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import Navbar from '../components/Navbar';

export default function AnalyticsPage() {
  const { settings, changeLanguage } = useSettings();
  const currentLanguage = settings?.language || 'en';
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const analyticsRef = useRef();

  // Translations
  const translations = {
    en: {
      header: "Analytics Dashboard 📊",
      subtitle: "Visualize crop predictions, weather trends, and AI-driven insights",
      filter: "Filter",
      exportPdf: "Export PDF",
      temperatureHumidity: "Temperature vs Humidity Trend",
      airQuality: "Air Quality Components",
      cropYield: "Crop Yield Prediction",
      aiInsights: "AI Insights & Recommendations",
      predictedRainfall: "Predicted Rainfall",
      idealCrop: "Ideal Crop",
      soilHealth: "Soil Health",
      aiConfidence: "AI Confidence",
      next7Days: "Next 7 days",
      currentSeason: "Current season",
      nitrogenLevels: "Nitrogen levels",
      predictionAccuracy: "Prediction accuracy",
      fromAvg: "from avg",
      optimalConditions: "Optimal conditions",
      balancedPH: "Balanced pH",
      highReliability: "High reliability",
      optimalConditionsInsight: "Current weather patterns are ideal for wheat cultivation.",
      soilHealthInsight: "Nitrogen levels are optimal. Maintain current fertilization schedule.",
      weatherAlert: "Light rainfall expected in 3 days. Plan irrigation accordingly.",
      yieldPrediction: "87% confidence in above-average wheat yield this season.",
      aiInsight: "Wheat shows highest yield potential due to optimal soil and weather conditions.",
      pdfSuccess: "PDF Downloaded Successfully!",
      generatingPdf: "Generating PDF...",
      loadingAnalytics: "Loading analytics..."
    },
    ur: {
      header: "تجزیاتی ڈیش بورڈ 📊",
      subtitle: "فصل کی پیشین گوئی، موسم کے رجحانات، اور AI کی تجاویز کو دیکھیں",
      filter: "فلٹر",
      exportPdf: "PDF ڈاؤن لوڈ کریں",
      temperatureHumidity: "درجہ حرارت اور نمی کا رجحان",
      airQuality: "ہوا کے معیار کے اجزاء",
      cropYield: "فصل کی پیداوار کی پیشین گوئی",
      aiInsights: "AI کی بصیرتیں اور تجاویز",
      predictedRainfall: "متوقع بارش",
      idealCrop: "مثالی فصل",
      soilHealth: "مٹی کی صحت",
      aiConfidence: "AI کا اعتماد",
      next7Days: "اگلے 7 دن",
      currentSeason: "موجودہ سیزن",
      nitrogenLevels: "نائٹروجن کی سطح",
      predictionAccuracy: "پیشین گوئی کی درستگی",
      fromAvg: "اوسط سے",
      optimalConditions: "بہترین حالات",
      balancedPH: "متوازن پی ایچ",
      highReliability: "اعلیٰ قابل اعتماد",
      optimalConditionsInsight: "موجودہ موسم کے نمونے گندم کی کاشت کے لیے مثالی ہیں۔",
      soilHealthInsight: "نائٹروجن کی سطح مثالی ہے۔ موجودہ کھاد کا شیڈول برقرار رکھیں۔",
      weatherAlert: "3 دن میں ہلکی بارش متوقع ہے۔ آبپاشی کی منصوبہ بندی کریں۔",
      yieldPrediction: "اس سیزن میں اوسط سے زیادہ گندم کی پیداوار کا 87% اعتماد۔",
      aiInsight: "مثالی مٹی اور موسمی حالات کی وجہ سے گندم میں پیداوار کی سب سے زیادہ صلاحیت ہے۔",
      pdfSuccess: "PDF کامیابی سے ڈاؤن لوڈ ہو گئی!",
      generatingPdf: "PDF تیار ہو رہی ہے...",
      loadingAnalytics: "تجزیات لوڈ ہو رہے ہیں..."
    }
  };

  const t = translations[currentLanguage];

  // Mock data for charts
  const temperatureHumidityData = [
    { day: 'Mon', temperature: 28, humidity: 65 },
    { day: 'Tue', temperature: 29, humidity: 62 },
    { day: 'Wed', temperature: 27, humidity: 68 },
    { day: 'Thu', temperature: 26, humidity: 72 },
    { day: 'Fri', temperature: 25, humidity: 70 },
    { day: 'Sat', temperature: 27, humidity: 66 },
    { day: 'Sun', temperature: 29, humidity: 60 }
  ];

  const aqiData = [
    { component: 'PM2.5', value: 35, safe: 50 },
    { component: 'PM10', value: 45, safe: 70 },
    { component: 'NO2', value: 20, safe: 40 },
    { component: 'SO2', value: 15, safe: 35 },
    { component: 'CO', value: 8, safe: 10 }
  ];

  const cropYieldData = [
    { name: 'Wheat', value: 35 },
    { name: 'Rice', value: 25 },
    { name: 'Cotton', value: 20 },
    { name: 'Sugarcane', value: 20 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  const summaryCards = [
    {
      title: t.predictedRainfall,
      value: '45mm',
      subtitle: t.next7Days,
      icon: CloudRain,
      color: 'blue',
      trend: `+12% ${t.fromAvg}`
    },
    {
      title: t.idealCrop,
      value: 'Wheat',
      subtitle: t.currentSeason,
      icon: Sprout,
      color: 'green',
      trend: t.optimalConditions
    },
    {
      title: t.soilHealth,
      value: 'Good',
      subtitle: t.nitrogenLevels,
      icon: Leaf,
      color: 'emerald',
      trend: t.balancedPH
    },
    {
      title: t.aiConfidence,
      value: '87%',
      subtitle: t.predictionAccuracy,
      icon: Brain,
      color: 'purple',
      trend: t.highReliability
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        temperatureHumidity: temperatureHumidityData,
        aqi: aqiData,
        cropYield: cropYieldData,
        summary: summaryCards
      });
      setLoading(false);
    }, 1500);
  }, [currentLanguage]);

  const downloadPDF = async () => {
    if (!analyticsRef.current) return;

    setExporting(true);
    try {
      // Add a class to override colors
      const exportArea = analyticsRef.current;
      exportArea.classList.add('force-hex-colors');

      // Wait a tick to ensure styles apply
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(exportArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff"
      });

      exportArea.classList.remove('force-hex-colors');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('analytics.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      emerald: 'from-emerald-500 to-teal-500',
      purple: 'from-purple-500 to-violet-500'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  // Replace toggleLanguage with context-based
  const toggleLanguage = () => {
    changeLanguage(currentLanguage === 'en' ? 'ur' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 text-lg">{t.loadingAnalytics}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Shared Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      {/* Filter and Export PDF Buttons */}
      <div className="container mx-auto flex justify-end items-center space-x-4 mt-6">
        <button className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>{t.filter}</span>
        </button>
        <button 
          onClick={downloadPDF}
          disabled={exporting}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center space-x-2"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{exporting ? t.generatingPdf : t.exportPdf}</span>
        </button>
      </div>

      {/* Main Content */}
      <div ref={analyticsRef} className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            {t.header}
          </h1>
          <p className="text-green-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${getColorClass(card.color)}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{card.trend}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
              <p className="text-gray-700 font-medium mb-1">{card.title}</p>
              <p className="text-gray-500 text-sm">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Temperature vs Humidity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              {t.temperatureHumidity}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureHumidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Temperature (°C)"
                  animationDuration={500}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Humidity (%)"
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AQI Components Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              {t.airQuality}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aqiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="component" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Current Level" 
                  fill="#10B981"
                  animationDuration={500}
                  radius={[4, 4, 0, 0]}
                >
                  {aqiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > entry.safe ? '#EF4444' : '#10B981'} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="safe" 
                  name="Safe Limit" 
                  fill="#6B7280"
                  animationDuration={500}
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Crop Yield Prediction */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 lg:col-span-2">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              {t.cropYield}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cropYieldData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={500}
                  >
                    {cropYieldData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col justify-center space-y-4">
                {cropYieldData.map((crop, index) => (
                  <div key={crop.name} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium text-gray-700">{crop.name}</span>
                    <span className="text-gray-500">{crop.value}% yield potential</span>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Brain className="w-4 h-4" />
                    <span className="font-medium">AI Insight</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    {t.aiInsight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            {t.aiInsights}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Optimal Conditions</h4>
                  <p className="text-blue-600 text-sm">{t.optimalConditionsInsight}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">Soil Health</h4>
                  <p className="text-green-600 text-sm">{t.soilHealthInsight}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Weather Alert</h4>
                  <p className="text-amber-600 text-sm">{t.weatherAlert}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-800">Yield Prediction</h4>
                  <p className="text-purple-600 text-sm">{t.yieldPrediction}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 animate-in slide-in-from-right duration-300">
          <div className="flex items-center space-x-3 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl shadow-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{t.pdfSuccess}</span>
          </div>
        </div>
      )}
    </div>
  );
}