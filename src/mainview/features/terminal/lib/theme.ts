import type { TerminalThemeConfig } from "@shared/config";
import type { ITheme } from "@xterm/xterm";

function readCssColor(variable: string, fallback: string): string {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable)
		.trim();
	return value || fallback;
}

/** Builds translucent scrollbar thumb colors from a hex foreground (xterm 6 slider). */
function scrollbarSliderColors(
	foregroundHex: string,
): Pick<
	ITheme,
	| "scrollbarSliderBackground"
	| "scrollbarSliderHoverBackground"
	| "scrollbarSliderActiveBackground"
> {
	const hex = foregroundHex.replace("#", "");
	if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
		return {
			scrollbarSliderBackground: "rgba(255, 255, 255, 0.28)",
			scrollbarSliderHoverBackground: "rgba(255, 255, 255, 0.42)",
			scrollbarSliderActiveBackground: "rgba(255, 255, 255, 0.52)",
		};
	}
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	return {
		scrollbarSliderBackground: `rgba(${r}, ${g}, ${b}, 0.28)`,
		scrollbarSliderHoverBackground: `rgba(${r}, ${g}, ${b}, 0.42)`,
		scrollbarSliderActiveBackground: `rgba(${r}, ${g}, ${b}, 0.52)`,
	};
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

type TerminalColorKey = Exclude<keyof ITheme, "extendedAnsi">;

const CSS_THEME_FALLBACKS: Partial<Record<TerminalColorKey, string>> = {
	background: "--background",
	foreground: "--foreground",
	cursor: "--foreground",
	cursorAccent: "--background",
	selectionBackground: "--accent",
};

export function createTerminalTheme(configTheme: TerminalThemeConfig): ITheme {
	const fromApp: Partial<Record<TerminalColorKey, string>> = {
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

	for (const key of Object.keys(fromApp) as TerminalColorKey[]) {
		const configured = fromApp[key];
		if (configured) {
			theme[key] = configured;
			continue;
		}

		const cssVar = CSS_THEME_FALLBACKS[key];
		if (cssVar) {
			const fallback = DEFAULT_THEME[key];
			theme[key] =
				typeof fallback === "string"
					? readCssColor(cssVar, fallback)
					: readCssColor(cssVar, "#000000");
		}
	}

	const foreground = theme.foreground ?? DEFAULT_THEME.foreground ?? "#d4d4d4";
	const background = theme.background ?? DEFAULT_THEME.background ?? "#1e1e1e";
	Object.assign(theme, scrollbarSliderColors(foreground));
	// Avoid a light strip when overview ruler is enabled elsewhere.
	theme.overviewRulerBorder = background;

	return theme;
}
