import React, { createContext, useContext, useState, useCallback } from 'react';
import { getTranslation } from '@/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('fp_lang') || 'fr');

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('fp_lang', newLang);
  }, []);

  const t = useCallback((key) => getTranslation(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}