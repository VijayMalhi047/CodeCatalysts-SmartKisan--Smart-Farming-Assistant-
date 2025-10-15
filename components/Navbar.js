import Link from 'next/link';

const navLabels = {
  en: {
    home: 'Home',
    advice: 'Advice',
    analytics: 'Analytics',
    chat: 'Chat',
    settings: 'Settings',
  },
  ur: {
    home: 'ہوم',
    advice: 'مشورہ',
    analytics: 'تجزیات',
    chat: 'چیٹ',
    settings: 'ترتیبات',
  },
};

import { useSettings } from '../lib/SettingsContext';

export default function Navbar() {
  const { settings, changeLanguage } = useSettings();
  const currentLanguage = settings?.language || 'en';
  const t = navLabels[currentLanguage] || navLabels.en;
  return (
    <nav className="bg-green-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🌾</span>
          <h1 className="text-xl font-bold">SmartKisan</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <span className="hover:underline cursor-pointer font-medium">{t.home}</span>
          </Link>
          <Link href="/advice">
            <span className="hover:underline cursor-pointer font-medium">{t.advice}</span>
          </Link>
          <Link href="/analytics">
            <span className="hover:underline cursor-pointer font-medium">{t.analytics}</span>
          </Link>
          <Link href="/chat">
            <span className="hover:underline cursor-pointer font-medium">{t.chat}</span>
          </Link>
          <Link href="/settings">
            <span className="hover:underline cursor-pointer font-medium">{t.settings}</span>
          </Link>
          <button
            onClick={() => changeLanguage(currentLanguage === 'en' ? 'ur' : 'en')}
            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            {currentLanguage === 'en' ? 'اردو' : 'English'}
          </button>
        </div>
      </div>
    </nav>
  );
}
