import en from "@renderer/locals/en.json";
import type { ReactNode } from "react";

type TranslationKey = keyof typeof en;

export function useTranslation() {
	return {
		t: (key: string) => en[key as TranslationKey] ?? key,
		i18n: { language: "en" },
	};
}

export function I18nextProvider({ children }: { children: ReactNode }) {
	return children;
}

export const initReactI18next = {
	type: "3rdParty",
	init: () => {},
};
