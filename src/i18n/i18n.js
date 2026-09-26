import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { brand } from '@/config/brand';
import bg from './bg.json';
import en from './en.json';

const storageKey = `${brand.storageKeyPrefix}-lang`;
const stored = localStorage.getItem(storageKey);

i18n.use(initReactI18next).init({
	resources: {
		bg: { translation: bg },
		en: { translation: en },
	},
	lng: brand.languages.includes(stored) ? stored : brand.defaultLanguage,
	fallbackLng: brand.defaultLanguage,
	interpolation: {
		escapeValue: false,
		defaultVariables: { brand: brand.siteName },
	},
});

i18n.on('languageChanged', (lang) => {
	localStorage.setItem(storageKey, lang);
	document.documentElement.lang = lang;
});

export default i18n;
