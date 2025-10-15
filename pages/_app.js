import { SettingsProvider, useSettings } from '../lib/SettingsContext';
import { useEffect } from 'react';
import '../styles/globals.css';

function ThemeWrapper({ children }) {
  const { settings } = useSettings();
  // Set theme on body
  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings?.theme]);
  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        <Component {...pageProps} />
      </ThemeWrapper>
    </SettingsProvider>
  );
}

export default MyApp;