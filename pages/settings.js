import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useSettings } from '../lib/SettingsContext';
import { 
  Save, 
  CheckCircle, 
  XCircle,
  Wheat,
  MapPin,
  Bell,
  Languages,
  Sun,
  Moon,
  Navigation
} from 'lucide-react';

function Settings() {
  const { settings, updateSettings, setTheme, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState(null);
  const [isSaved, setIsSaved] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Popular crops with icons
  const crops = [
    { value: 'wheat', label: 'Wheat', icon: '🌾' },
    { value: 'rice', label: 'Rice', icon: '🍚' },
    { value: 'cotton', label: 'Cotton', icon: '🧵' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
    { value: 'corn', label: 'Corn', icon: '🌽' },
    { value: 'soybean', label: 'Soybean', icon: '🫘' }
  ];

  // Regions in Pakistan with coordinates
  const regions = [
    { name: 'Punjab', lat: '31.5204', lng: '74.3587' },
    { name: 'Sindh', lat: '24.8607', lng: '67.0011' },
    { name: 'Khyber Pakhtunkhwa', lat: '34.0151', lng: '71.5249' },
    { name: 'Balochistan', lat: '30.1798', lng: '66.9750' },
    { name: 'Gilgit-Baltistan', lat: '35.2931', lng: '75.6333' },
    { name: 'Azad Jammu & Kashmir', lat: '33.9258', lng: '73.7811' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ur', label: 'اردو' }
  ];

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon }
  ];

  const units = [
    { value: 'metric', label: 'Metric (km, °C, mm)' },
    { value: 'imperial', label: 'Imperial (miles, °F, inches)' }
  ];

  // Initialize local settings when settings are loaded
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Check if settings have changed
  useEffect(() => {
    if (settings && localSettings) {
      setIsSaved(JSON.stringify(settings) === JSON.stringify(localSettings));
    }
  }, [localSettings, settings]);

  const handleInputChange = (field, value) => {
    setLocalSettings(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleNotificationChange = (type, checked) => {
    setLocalSettings(prev => {
      const updated = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: checked
        }
      };
      return updated;
    });
  };

  const handleRegionSelect = (region) => {
    setLocalSettings(prev => {
      const updated = {
        ...prev,
        region: region.name,
        coordinates: {
          lat: region.lat,
          lng: region.lng
        }
      };
      return updated;
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let matchedRegion = regions.find(r =>
          Math.abs(parseFloat(r.lat) - latitude) < 1 &&
          Math.abs(parseFloat(r.lng) - longitude) < 1
        );
        setLocalSettings(prev => {
          const updated = {
            ...prev,
            region: matchedRegion ? matchedRegion.name : 'Custom',
            coordinates: {
              lat: latitude.toString(),
              lng: longitude.toString()
            }
          };
          return updated;
        });
        showSuccess('Location detected successfully!');
      },
      (error) => {
        console.error('Error getting location:', error);
        showError('Failed to detect location. Please select manually.');
      }
    );
  };

  const handleSave = () => {
    if (!localSettings.region) {
      showError('Please select your region');
      return;
    }

    updateSettings(localSettings);
    setTheme(localSettings.theme);
    showSuccess('Settings saved successfully!');
  };

  const showSuccess = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showError = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 rounded-lg mr-3">
          <Icon className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-green-800">{title}</h2>
      </div>
      {children}
    </div>
  );

  if (loading || !localSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar currentLanguage={localSettings?.language || 'en'} toggleLanguage={() => handleInputChange('language', localSettings?.language === 'en' ? 'ur' : 'en')} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            Farm Settings ⚙️
          </h1>
          <p className="text-green-600 text-lg">
            Customize your SmartKisan experience
          </p>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Crop Type Section */}
          <SettingSection title="Crop Type" icon={Wheat}>
            <p className="text-gray-600 mb-4">Select your primary crop for personalized advice</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {crops.map((crop) => (
                <button
                  key={crop.value}
                  onClick={() => handleInputChange('cropType', crop.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    localSettings.cropType === crop.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{crop.icon}</div>
                  <div className="font-medium text-gray-800">{crop.label}</div>
                </button>
              ))}
            </div>
          </SettingSection>

          {/* Region Section */}
          <SettingSection title="Region" icon={MapPin}>
            <p className="text-gray-600 mb-4">Select your region for accurate weather data</p>
            
            {/* Auto-detect Location Button */}
            <button
              onClick={detectLocation}
              className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Detect My Location</span>
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regions.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionSelect(region)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    localSettings.region === region.name
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{region.name}</div>
                  {localSettings.region === region.name ? (
                    <div className="text-xs text-green-600 mt-1">Current</div>
                  ) : null}
                </button>
              ))}
            </div>
          </SettingSection>

          {/* Language Section */}
          <SettingSection title="Language" icon={Languages}>
            <p className="text-gray-600 mb-4">Choose your preferred language</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {languages.map((language) => (
                <button
                  key={language.value}
                  onClick={() => handleInputChange('language', language.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    localSettings.language === language.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{language.label}</div>
                </button>
              ))}
            </div>
          </SettingSection>

          {/* Theme Section */}
          <SettingSection title="Theme" icon={Sun}>
            <p className="text-gray-600 mb-4">Choose your preferred theme</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleInputChange('theme', theme.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                    localSettings.theme === theme.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <theme.icon className="w-5 h-5" />
                  <div className="font-medium text-gray-800">{theme.label}</div>
                </button>
              ))}
            </div>
          </SettingSection>

          {/* Units Section */}
          <SettingSection title="Units" icon={MapPin}>
            <p className="text-gray-600 mb-4">Choose your preferred measurement units</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {units.map((unit) => (
                <button
                  key={unit.value}
                  onClick={() => handleInputChange('units', unit.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    localSettings.units === unit.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{unit.label}</div>
                </button>
              ))}
            </div>
          </SettingSection>

          {/* Notifications Section */}
          <SettingSection title="Notifications" icon={Bell}>
            <p className="text-gray-600 mb-4">Choose how you want to receive alerts</p>
            <div className="space-y-4 max-w-md">
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notifications?.email || false}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <div className="font-medium text-gray-800">Email Notifications</div>
                  <div className="text-sm text-gray-600">Receive advice and alerts via email</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.notifications?.sms || false}
                  onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <div className="font-medium text-gray-800">SMS Alerts</div>
                  <div className="text-sm text-gray-600">Get important alerts via SMS</div>
                </div>
              </label>
            </div>
          </SettingSection>

          {/* Save Button */}
          <div className="text-center">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`
                inline-flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg
                transition-all duration-300 transform
                ${isSaved
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
            
            {isSaved && (
              <p className="text-green-600 mt-3 flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>All changes saved</span>
              </p>
            )}
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Current Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Crop Type:</span>
              <span className="font-medium text-gray-800 ml-2">
                {crops.find(c => c.value === localSettings.cropType)?.label || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Region:</span>
              <span className="font-medium text-gray-800 ml-2">
                {localSettings.region || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Language:</span>
              <span className="font-medium text-gray-800 ml-2">
                {languages.find(l => l.value === localSettings.language)?.label || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Theme:</span>
              <span className="font-medium text-gray-800 ml-2">
                {themes.find(t => t.value === localSettings.theme)?.label || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Units:</span>
              <span className="font-medium text-gray-800 ml-2">
                {units.find(u => u.value === localSettings.units)?.label || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Notifications:</span>
              <span className="font-medium text-gray-800 ml-2">
                {[
                  localSettings.notifications?.email && 'Email',
                  localSettings.notifications?.sms && 'SMS'
                ].filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
            {localSettings.coordinates && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Coordinates:</span>
                <span className="font-medium text-gray-800 ml-2">
                  {localSettings.coordinates.lat}, {localSettings.coordinates.lng}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 animate-in slide-in-from-right duration-300">
          <div className={`
            flex items-center space-x-3 p-4 rounded-xl shadow-lg border
            ${toastType === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
            }
          `}>
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toastMessage}</span>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;