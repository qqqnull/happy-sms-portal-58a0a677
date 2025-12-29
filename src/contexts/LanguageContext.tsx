import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.zh) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'zh';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key: keyof typeof translations.zh): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
