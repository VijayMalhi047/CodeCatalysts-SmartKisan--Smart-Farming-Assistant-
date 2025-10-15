// pages/advice.js - Updated version
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useSettings } from '../lib/SettingsContext';
import { Brain, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const AdvicePage = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const [adviceData, setAdviceData] = useState(null);
  const [fallbackAdvice, setFallbackAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Translations
  const translations = {
    en: {
      header: "Weekly Smart Advice 🌾",
      subtitle: "AI-Powered Farming Recommendations",
      regenerate: "Regenerate Advice",
      irrigation: "Irrigation 💧",
      sowing: "Sowing 🌱", 
      harvesting: "Harvesting ✂️",
      fertilizer: "Fertilizer Usage 🌿",
      pestControl: "Pest Control 🐛",
      weatherAlerts: "Weather Alerts ⚠️",
      schedule: "Schedule",
      waterAmount: "Water Amount",
      urgency: "Urgency",
      type: "Type",
      quantity: "Quantity",
      timing: "Timing",
      commonPests: "Common Pests",
      organicOptions: "Organic Options",
      currentRisks: "Current Risks",
      precautions: "Precautions",
      timeline: "Timeline",
      high: "High",
      medium: "Medium",
      low: "Low",
      optimalTiming: "Optimal Timing",
      preparation: "Preparation",
      harvestWindow: "Harvest Window",
      yieldExpectation: "Yield Expectation",
      loadingAdvice: "Generating personalized advice...",
      lastUpdated: "Last updated",
      proTip: "💡 Pro Tip",
      proTipText: "Implement these recommendations for optimal results.",
      errorGenerating: "Failed to generate advice",
      retry: "Retry",
      apiError: "API connection issue", //- using demo data
    },
    ur: {
      header: "ہفتہ وار سمارٹ مشورے 🌾",
      subtitle: "AI سے طاقتور کاشتکاری کے مشورے",
      regenerate: "نیا مشورہ حاصل کریں",
      irrigation: "آبپاشی 💧",
      sowing: "بونا 🌱",
      harvesting: "کٹائی ✂️",
      fertilizer: "کھاد کا استعمال 🌿", 
      pestControl: "کیڑوں کا کنٹرول 🐛",
      weatherAlerts: "موسمی انتباہات ⚠️",
      schedule: "شیڈول",
      waterAmount: "پانی کی مقدار",
      urgency: "فوری ضرورت",
      type: "قسم",
      quantity: "مقدار",
      timing: "وقت",
      commonPests: "عام کیڑے",
      organicOptions: "نامیاتی آپشنز",
      currentRisks: "موجودہ خطرات",
      precautions: "احتیاطی تدابیر",
      timeline: "ٹائم لائن",
      high: "زیادہ",
      medium: "درمیانی",
      low: "کم",
      optimalTiming: "مثالی وقت",
      preparation: "تیاری",
      harvestWindow: "کٹائی کا وقت",
      yieldExpectation: "پیداوار کی توقع",
      loadingAdvice: "ذاتی نوعیت کا مشورہ تیار کیا جا رہا ہے...",
      lastUpdated: "آخری اپ ڈیٹ",
      proTip: "💡 پیشہ ورانہ صلاح",
      proTipText: "بہترین نتائج کے لیے ان تجاویز کو نافذ کریں۔",
      errorGenerating: "مشورہ تیار کرنے میں ناکامی",
      retry: "دوبارہ کوشش کریں",
      apiError: "API کنکشن مسئلہ - نہ استعمال ہو رہا ہے" //ڈیمو ڈیٹا
    }
  };

  // Use settings language or default to 'en'
  const currentLanguage = settings?.language || 'en';
  const t = translations[currentLanguage];

  // Initialize with demo data
  useEffect(() => {
    if (!settingsLoading) {
      const demoData = {
        irrigation: {
          recommendation: currentLanguage === 'en' 
            ? "Water crops early morning for optimal absorption. Adjust based on rainfall."
            : "بہترین جذب کے لیے صبح سویرے فصلوں کو پانی دیں۔ بارش کے مطابق ایڈجسٹ کریں۔",
          schedule: currentLanguage === 'en' ? "Monday and Thursday" : "سوموار اور جمعرات",
          water_amount: currentLanguage === 'en' ? "30mm per session" : "ہر سیشن میں 30 ملی میٹر",
          urgency: "medium"
        },
        fertilizer: {
          recommendation: currentLanguage === 'en'
            ? "Apply balanced NPK fertilizer after next irrigation cycle."
            : "اگلے آبپاشی سائیکل کے بعد متوازن این پی کے کھاد ڈالیں۔",
          type: "NPK 50:25:25",
          quantity: currentLanguage === 'en' ? "50kg/acre" : "50 کلوگرام فی ایکڑ",
          timing: currentLanguage === 'en' ? "After irrigation" : "آبپاشی کے بعد"
        },
        pest_control: {
          recommendation: currentLanguage === 'en'
            ? "Monitor for common pests. Use organic treatments first."
            : "عام کیڑوں کی نگرانی کریں۔ پہلے نامیاتی علاج استعمال کریں۔",
          common_pests: currentLanguage === 'en' ? "Aphids, Army worms" : "ایفڈز، آرمی کیڑے",
          organic_options: currentLanguage === 'en' ? "Neem oil, Garlic spray" : "نیم کا تیل، لہسن کا سپرے"
        },
        sowing_harvest: {
          optimal_timing: currentLanguage === 'en' ? "October-November" : "اکتوبر-نومبر",
          preparation: currentLanguage === 'en' ? "Prepare field with proper leveling" : "کھیت کو مناسب ہمواری کے ساتھ تیار کریں",
          harvest_window: currentLanguage === 'en' ? "April-May" : "اپریل-مئی",
          yield_expectation: currentLanguage === 'en' ? "28-32 quintals/acre" : "28-32 کونٹل فی ایکڑ"
        },
        weather_alerts: {
          recommendation: currentLanguage === 'en'
            ? "No severe weather alerts. Normal seasonal conditions."
            : "کوئی شدید موسمی انتباہات نہیں۔ عام موسمی حالات۔",
          current_risks: currentLanguage === 'en' ? "Low risk" : "کم خطرہ",
          precautions: currentLanguage === 'en' ? "Continue normal monitoring" : "نارمل نگرانی جاری رکھیں",
          timeline: currentLanguage === 'en' ? "Next 7 days stable" : "اگلے 7 دن مستحکم"
        },
        summary: currentLanguage === 'en'
          ? "Good conditions for wheat cultivation in Punjab region."
          : "پنجاب خطے میں گندم کی کاشت کے لیے اچھے حالات۔",
        confidence: "medium"
      };

      setAdviceData(demoData);
    }
  }, [settingsLoading, currentLanguage]);

  const fetchAIAdvice = async () => {
    if (settingsLoading || !settings) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Give me weekly farming advice for my region.',
          conversationHistory: [],
          language: settings.language,
          userRegion: settings.region
        })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        setError(t.apiError);
        // Restore demo data if error
        setAdviceData(getDemoData(currentLanguage));
        return;
      }

      const result = await response.json();

      if (result.success) {
        setAdviceData(result.advice);
        setLastUpdated(new Date().toLocaleString());
        setError(null);
      } else {
        setError(result.error || t.errorGenerating);
        setAdviceData(getDemoData(currentLanguage));
      }
    } catch (error) {
      console.error('Error fetching AI advice:', error);
      setError(t.apiError);
      setAdviceData(getDemoData(currentLanguage));
    } finally {
      setLoading(false);
    }
  };

  // Helper to get demo data for fallback
  function getDemoData(lang) {
    return {
      irrigation: {
        recommendation: lang === 'en' 
          ? "Water crops early morning for optimal absorption. Adjust based on rainfall."
          : "بہترین جذب کے لیے صبح سویرے فصلوں کو پانی دیں۔ بارش کے مطابق ایڈجسٹ کریں۔",
        schedule: lang === 'en' ? "Monday and Thursday" : "سوموار اور جمعرات",
        water_amount: lang === 'en' ? "30mm per session" : "ہر سیشن میں 30 ملی میٹر",
        urgency: "medium"
      },
      fertilizer: {
        recommendation: lang === 'en'
          ? "Apply balanced NPK fertilizer after next irrigation cycle."
          : "اگلے آبپاشی سائیکل کے بعد متوازن این پی کے کھاد ڈالیں۔",
        type: "NPK 50:25:25",
        quantity: lang === 'en' ? "50kg/acre" : "50 کلوگرام فی ایکڑ",
        timing: lang === 'en' ? "After irrigation" : "آبپاشی کے بعد"
      },
      pest_control: {
        recommendation: lang === 'en'
          ? "Monitor for common pests. Use organic treatments first."
          : "عام کیڑوں کی نگرانی کریں۔ پہلے نامیاتی علاج استعمال کریں۔",
        common_pests: lang === 'en' ? "Aphids, Army worms" : "ایفڈز، آرمی کیڑے",
        organic_options: lang === 'en' ? "Neem oil, Garlic spray" : "نیم کا تیل، لہسن کا سپرے"
      },
      sowing_harvest: {
        optimal_timing: lang === 'en' ? "October-November" : "اکتوبر-نومبر",
        preparation: lang === 'en' ? "Prepare field with proper leveling" : "کھیت کو مناسب ہمواری کے ساتھ تیار کریں",
        harvest_window: lang === 'en' ? "April-May" : "اپریل-مئی",
        yield_expectation: lang === 'en' ? "28-32 quintals/acre" : "28-32 کونٹل فی ایکڑ"
      },
      weather_alerts: {
        recommendation: lang === 'en'
          ? "No severe weather alerts. Normal seasonal conditions."
          : "کوئی شدید موسمی انتباہات نہیں۔ عام موسمی حالات۔",
        current_risks: lang === 'en' ? "Low risk" : "کم خطرہ",
        precautions: lang === 'en' ? "Continue normal monitoring" : "نارمل نگرانی جاری رکھیں",
        timeline: lang === 'en' ? "Next 7 days stable" : "اگلے 7 دن مستحکم"
      },
      summary: lang === 'en'
        ? "Good conditions for wheat cultivation in Punjab region."
        : "پنجاب خطے میں گندم کی کاشت کے لیے اچھے حالات۔",
      confidence: "medium"
    };
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyText = (urgency) => {
    const urgencyMap = {
      high: t.high,
      medium: t.medium,
      low: t.low
    };
    return urgencyMap[urgency] || urgency;
  };

  // Show loading while settings are loading
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800">Loading SmartKisan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar currentLanguage={settings?.language || 'en'} />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            {t.header}
          </h1>
          <p className="text-green-600 text-lg mb-6">
            {t.subtitle}
          </p>

          {/* User Settings Info */}
          {settings && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 max-w-md mx-auto mb-6">
              <div className="flex items-center justify-center space-x-4 text-sm text-green-700">
                <span>🌱 {settings.cropType}</span>
                <span>📍 {settings.region}</span>
                {!error && (
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Demo Data</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button - CENTERED */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAIAdvice();
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              <span>{loading ? t.loadingAdvice : t.regenerate}</span>
            </button>
          </div>

          {/* Retry Button - CENTERED */}
          {error && (
            <div className="flex justify-center">
              <button
                onClick={fetchAIAdvice}
                className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.retry}</span>
              </button>
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && !error && (
            <p className="text-gray-500 text-sm mt-3 text-center">
              {t.lastUpdated}: {lastUpdated}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-amber-800 font-medium">{error}</p>
                <p className="text-amber-700 text-sm mt-1">
                  {currentLanguage === 'en' 
                    ? "You can still use the advice below." // demo advice below
                    : "آپ اب بھی نیچے دیے گئے مشورے استعمال کر سکتے ہیں۔" //دیے گئے ڈیمو
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advice Cards Grid */}
        {adviceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Irrigation Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">💧</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.irrigation}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{adviceData.irrigation.recommendation}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t.schedule}:</span>
                      <p className="text-gray-800">{adviceData.irrigation.schedule}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.waterAmount}:</span>
                      <p className="text-gray-800">{adviceData.irrigation.water_amount}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">{t.urgency}:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(adviceData.irrigation.urgency)}`}>
                        {getUrgencyText(adviceData.irrigation.urgency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fertilizer Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🌿</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.fertilizer}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{adviceData.fertilizer.recommendation}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t.type}:</span>
                      <p className="text-gray-800">{adviceData.fertilizer.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.quantity}:</span>
                      <p className="text-gray-800">{adviceData.fertilizer.quantity}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">{t.timing}:</span>
                      <p className="text-gray-800">{adviceData.fertilizer.timing}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pest Control Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🐛</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.pestControl}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{adviceData.pest_control.recommendation}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t.commonPests}:</span>
                      <p className="text-gray-800">{adviceData.pest_control.common_pests}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.organicOptions}:</span>
                      <p className="text-gray-800">{adviceData.pest_control.organic_options}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sowing & Harvesting Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🌱</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.sowing} & {t.harvesting}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t.optimalTiming}:</span>
                      <p className="text-gray-800">{adviceData.sowing_harvest.optimal_timing}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.preparation}:</span>
                      <p className="text-gray-800">{adviceData.sowing_harvest.preparation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.harvestWindow}:</span>
                      <p className="text-gray-800">{adviceData.sowing_harvest.harvest_window}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.yieldExpectation}:</span>
                      <p className="text-gray-800">{adviceData.sowing_harvest.yield_expectation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Alerts Card - Full Width */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-red-200">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.weatherAlerts}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{adviceData.weather_alerts.recommendation}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t.currentRisks}:</span>
                      <p className="text-gray-800">{adviceData.weather_alerts.current_risks}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.precautions}:</span>
                      <p className="text-gray-800">{adviceData.weather_alerts.precautions}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t.timeline}:</span>
                      <p className="text-gray-800">{adviceData.weather_alerts.timeline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-green-600 text-lg">{t.loadingAdvice}</p>
          </div>
        )}

        {/* Pro Tip Section */}
        {adviceData && !loading && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-green-800 mb-3">
                {t.proTip}
              </h3>
              <p className="text-gray-700">
                {t.proTipText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvicePage;