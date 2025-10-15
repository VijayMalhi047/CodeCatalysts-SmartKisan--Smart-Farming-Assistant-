// lib/SettingsContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default settings
  const defaultSettings = {
    cropType: 'wheat',
    region: 'punjab',
    language: 'en',
    notifications: {
      email: true,
      sms: false
    },
    units: 'metric',
    theme: 'light',
    coordinates: {
      lat: '31.5204',
      lng: '74.3587'
    }
  };

  // Load settings from localStorage on initial load
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('smartkisan-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } else {
          setSettings(defaultSettings);
          localStorage.setItem('smartkisan-settings', JSON.stringify(defaultSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings and persist to localStorage
  // If newSettings has all keys, replace; if partial, merge
  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const isFull = newSettings && Object.keys(newSettings).length >= Object.keys(defaultSettings).length;
      const updated = isFull ? { ...defaultSettings, ...newSettings } : { ...prev, ...newSettings };
      localStorage.setItem('smartkisan-settings', JSON.stringify(updated));
      return updated;
    });
  };
  // Directly set theme
  const setTheme = (theme) => {
    updateSetting('theme', theme);
  };

  // Update specific setting
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('smartkisan-settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Change language globally
  const changeLanguage = (language) => {
    updateSetting('language', language);
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updateSetting,
    changeLanguage,
    setTheme
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};