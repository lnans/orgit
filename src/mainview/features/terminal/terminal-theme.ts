import type { TerminalThemeConfig } from "@shared/config";
import type { ITheme } from "@xterm/xterm";

function readCssColor(variable: string, fallback: string): string {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable)
		.trim();
	return value || fallback;
}

const DEFAULT_THEME: ITheme = {
	background: "#1e1e1e",
	foreground: "#d4d4d4",
	cursor: "#d4d4d4",
	cursorAccent: "#1e1e1e",
	selectionBackground: "#264f78",
	black: "#000000",
	red: "#cd3131",
	green: "#0dbc79",
	yellow: "#e5e510",
	blue: "#2472c8",
	magenta: "#bc3fbc",
	cyan: "#11a8cd",
	white: "#e5e5e5",
	brightBlack: "#666666",
	brightRed: "#f14c4c",
	brightGreen: "#23d18b",
	brightYellow: "#f5f543",
	brightBlue: "#3b8eea",
	brightMagenta: "#d670d6",
	brightCyan: "#29b8db",
	brightWhite: "#ffffff",
};

const CSS_THEME_FALLBACKS: Partial<Record<keyof ITheme, string>> = {
	background: "--background",
	foreground: "--foreground",
	cursor: "--foreground",
	cursorAccent: "--background",
	selectionBackground: "--accent",
};

export function createTerminalTheme(configTheme: TerminalThemeConfig): ITheme {
	const fromApp: Partial<ITheme> = {
		background: configTheme.background,
		foreground: configTheme.foreground,
		cursor: configTheme.cursor,
		cursorAccent: configTheme.cursorAccent,
		selectionBackground: configTheme.selectionBackground,
		selectionForeground: configTheme.selectionForeground,
		black: configTheme.black,
		red: configTheme.red,
		green: configTheme.green,
		yellow: configTheme.yellow,
		blue: configTheme.blue,
		magenta: configTheme.magenta,
		cyan: configTheme.cyan,
		white: configTheme.white,
		brightBlack: configTheme.brightBlack,
		brightRed: configTheme.brightRed,
		brightGreen: configTheme.brightGreen,
		brightYellow: configTheme.brightYellow,
		brightBlue: configTheme.brightBlue,
		brightMagenta: configTheme.brightMagenta,
		brightCyan: configTheme.brightCyan,
		brightWhite: configTheme.brightWhite,
	};

	const theme: ITheme = { ...DEFAULT_THEME };

	for (const key of Object.keys(fromApp) as Array<keyof ITheme>) {
		const configured = fromApp[key];
		if (configured) {
			theme[key] = configured;
			continue;
		}

		const cssVar = CSS_THEME_FALLBACKS[key];
		if (cssVar) {
			theme[key] = readCssColor(cssVar, DEFAULT_THEME[key] as string);
		}
	}

	return theme;
}
