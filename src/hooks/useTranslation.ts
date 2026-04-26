import { useState, useCallback } from 'react';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    () => localStorage.getItem('electiq_lang') || 'en'
  );

  const setLanguage = useCallback((langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('electiq_lang', langCode);
  }, []);

  const translate = useCallback(
    (text: string) => {
      if (currentLanguage === 'en') return text;
      return `[${currentLanguage}] ${text}`;
    },
    [currentLanguage]
  );

  return { currentLanguage, setLanguage, translate };
};
