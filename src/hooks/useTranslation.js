import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing UI language and translating text.
 * @returns {Object} { currentLanguage, setLanguage, translate }
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(
    () => localStorage.getItem('electiq_lang') || 'en'
  );

  const setLanguage = useCallback((langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('electiq_lang', langCode);
  }, []);

  const translate = useCallback(
    (text) => {
      if (currentLanguage === 'en') return text;
      // Normally we would have a dictionary loaded, or call the backend translation proxy
      // if it's dynamic text. For standard UI elements, i18next is preferred.
      // We'll mock the translation effect per instructions.
      return `[${currentLanguage}] ${text}`;
    },
    [currentLanguage]
  );

  return { currentLanguage, setLanguage, translate };
};
