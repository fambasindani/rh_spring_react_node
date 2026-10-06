import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import en from './en.json';
import sw from './sw.json';
import ln from './ln.json';
import kg from './kg.json';
import lu from './lu.json';

const STORAGE_KEY = 'lang';

export type AppLanguage = 'fr' | 'en' | 'sw' | 'ln' | 'kg' | 'lu';

export interface LanguageOption {
  code: AppLanguage;
  label: string;   // nom natif
  country: string; // code pays pour le drapeau (flag-icons)
}

// Drapeaux via flag-icons (SVG) — les langues locales de la RDC partagent le drapeau 🇨🇩 (cd).
export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', country: 'fr' },
  { code: 'en', label: 'English', country: 'gb' },
  { code: 'sw', label: 'Kiswahili', country: 'cd' },
  { code: 'ln', label: 'Lingála', country: 'cd' },
  { code: 'kg', label: 'Kikɔ́ngɔ', country: 'cd' },
  { code: 'lu', label: 'Tshiluba', country: 'cd' },
];

const CODES = LANGUAGES.map((l) => l.code);

export const getLanguageOption = (code: string): LanguageOption =>
  LANGUAGES.find((l) => l.code === code) ??
  LANGUAGES.find((l) => code.toLowerCase().startsWith(l.code)) ??
  LANGUAGES[0];

const detectLanguage = (): AppLanguage => {
  const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
  if (saved && CODES.includes(saved)) return saved;
  const nav = navigator.language?.toLowerCase() ?? '';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('sw')) return 'sw';
  if (nav.startsWith('ln')) return 'ln';
  if (nav.startsWith('kg')) return 'kg';
  if (nav.startsWith('lu')) return 'lu';
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    sw: { translation: sw },
    ln: { translation: ln },
    kg: { translation: kg },
    lu: { translation: lu },
  },
  lng: detectLanguage(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language;

export default i18n;
