import { useTranslation } from '../hooks/useTranslation';
import styles from './LanguageSelector.module.css';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <div className={styles.selectorContainer}>
      <label htmlFor="lang-select" className={styles.visuallyHidden}>
        Select Language
      </label>
      <select
        id="lang-select"
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        className={styles.selectBox}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
