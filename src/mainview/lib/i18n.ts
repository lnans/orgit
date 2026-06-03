import en from "@client/locales/en.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
	resources: {
		en: {
			translation: en,
		},
	},
	fallbackLng: ["en"],
	supportedLngs: ["en"],
	interpolation: {
		// React escapes rendered text; i18next's default HTML entity encoding breaks
		// branch names and paths (e.g. releases/4.1.14 → releases&#x2F;4.1.14).
		escapeValue: false,
	},
});

export { i18next };
