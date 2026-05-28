/** User-editable keys under `config.json` → `terminal.theme` (xterm.js colors). */
export type TerminalThemeConfig = {
	background?: string;
	foreground?: string;
	cursor?: string;
	cursorAccent?: string;
	selectionBackground?: string;
	selectionForeground?: string;
	black?: string;
	red?: string;
	green?: string;
	yellow?: string;
	blue?: string;
	magenta?: string;
	cyan?: string;
	white?: string;
	brightBlack?: string;
	brightRed?: string;
	brightGreen?: string;
	brightYellow?: string;
	brightBlue?: string;
	brightMagenta?: string;
	brightCyan?: string;
	brightWhite?: string;
};

export type TerminalConfig = {
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	lineHeight: number;
	letterSpacing: number;
	cursorBlink: boolean;
	scrollback: number;
	theme: TerminalThemeConfig;
};

export const CONFIG_VERSION = 1;

export type AppConfig = {
	version: number;
	terminal: TerminalConfig;
};

/** Dracula — matches `personal.config.macos/configs/alacritty.toml`. */
export const DEFAULT_TERMINAL_THEME: TerminalThemeConfig = {
	background: "#282a36",
	foreground: "#f8f8f2",
	cursor: "#f8f8f2",
	cursorAccent: "#282a36",
	selectionBackground: "#44475a",
	selectionForeground: "#f8f8f2",
	black: "#21222c",
	red: "#ff5555",
	green: "#50fa7b",
	yellow: "#f1fa8c",
	blue: "#bd93f9",
	magenta: "#ff79c6",
	cyan: "#8be9fd",
	white: "#f8f8f2",
	brightBlack: "#6272a4",
	brightRed: "#ff6e6e",
	brightGreen: "#69ff94",
	brightYellow: "#ffffa5",
	brightBlue: "#d6acff",
	brightMagenta: "#ff92df",
	brightCyan: "#a4ffff",
	brightWhite: "#ffffff",
};

export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
	fontFamily: '"FiraCode Nerd Font", ui-monospace, Menlo, Monaco, monospace',
	fontSize: 10,
	fontWeight: "normal",
	lineHeight: 1.2,
	letterSpacing: 0,
	cursorBlink: true,
	scrollback: 10_000,
	theme: DEFAULT_TERMINAL_THEME,
};

export const DEFAULT_APP_CONFIG: AppConfig = {
	version: CONFIG_VERSION,
	terminal: DEFAULT_TERMINAL_CONFIG,
};

const THEME_KEYS = [
	"background",
	"foreground",
	"cursor",
	"cursorAccent",
	"selectionBackground",
	"selectionForeground",
	"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"white",
	"brightBlack",
	"brightRed",
	"brightGreen",
	"brightYellow",
	"brightBlue",
	"brightMagenta",
	"brightCyan",
	"brightWhite",
] as const satisfies ReadonlyArray<keyof TerminalThemeConfig>;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
	record: Record<string, unknown>,
	key: string,
	fallback: string,
): string {
	const value = record[key];
	return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readBoolean(
	record: Record<string, unknown>,
	key: string,
	fallback: boolean,
): boolean {
	const value = record[key];
	return typeof value === "boolean" ? value : fallback;
}

function readPositiveNumber(
	record: Record<string, unknown>,
	key: string,
	fallback: number,
): number {
	const value = record[key];
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
		return fallback;
	}
	return value;
}

function readNonNegativeNumber(
	record: Record<string, unknown>,
	key: string,
	fallback: number,
): number {
	const value = record[key];
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
		return fallback;
	}
	return value;
}

function parseTerminalTheme(raw: unknown): TerminalThemeConfig {
	if (!isRecord(raw)) {
		return { ...DEFAULT_TERMINAL_THEME };
	}

	const theme: TerminalThemeConfig = {};
	for (const key of THEME_KEYS) {
		const value = raw[key];
		if (typeof value === "string" && value.length > 0) {
			theme[key] = value;
		}
	}
	return theme;
}

function parseTerminalConfig(raw: unknown): TerminalConfig {
	if (!isRecord(raw)) {
		return structuredClone(DEFAULT_TERMINAL_CONFIG);
	}

	return {
		fontFamily: readString(
			raw,
			"fontFamily",
			DEFAULT_TERMINAL_CONFIG.fontFamily,
		),
		fontSize: readPositiveNumber(
			raw,
			"fontSize",
			DEFAULT_TERMINAL_CONFIG.fontSize,
		),
		fontWeight: readString(
			raw,
			"fontWeight",
			DEFAULT_TERMINAL_CONFIG.fontWeight,
		),
		lineHeight: readPositiveNumber(
			raw,
			"lineHeight",
			DEFAULT_TERMINAL_CONFIG.lineHeight,
		),
		letterSpacing: readNonNegativeNumber(
			raw,
			"letterSpacing",
			DEFAULT_TERMINAL_CONFIG.letterSpacing,
		),
		cursorBlink: readBoolean(
			raw,
			"cursorBlink",
			DEFAULT_TERMINAL_CONFIG.cursorBlink,
		),
		scrollback: readPositiveNumber(
			raw,
			"scrollback",
			DEFAULT_TERMINAL_CONFIG.scrollback,
		),
		theme: parseTerminalTheme(raw.theme),
	};
}

export function parseAppConfig(raw: unknown): AppConfig {
	if (!isRecord(raw)) {
		return structuredClone(DEFAULT_APP_CONFIG);
	}

	const version =
		typeof raw.version === "number" && Number.isFinite(raw.version)
			? raw.version
			: 0;

	return {
		version,
		terminal: parseTerminalConfig(raw.terminal),
	};
}
