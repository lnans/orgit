import enRes from "@renderer/locals/en.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
	fallbackLng: ["en"],
	supportedLngs: ["en"],
	lng: "en",
	resources: {
		en: {
			translation: enRes,
		},
	},
});

export { i18next };
