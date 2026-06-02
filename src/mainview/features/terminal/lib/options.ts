import type { TerminalConfig } from "@shared/config";
import type { ITerminalOptions, ITheme } from "@xterm/xterm";
import { createTerminalTheme } from "./theme";

function toFontWeight(weight: string): ITerminalOptions["fontWeight"] {
	if (weight === "normal" || weight === "bold") {
		return weight;
	}
	const numeric = Number(weight);
	if (numeric >= 100 && numeric <= 900 && numeric % 100 === 0) {
		return numeric as ITerminalOptions["fontWeight"];
	}
	return "normal";
}

export function buildTerminalOptions(
	terminalConfig: TerminalConfig,
): ITerminalOptions {
	return {
		allowProposedApi: true,
		cursorBlink: terminalConfig.cursorBlink,
		customGlyphs: true,
		fontFamily: terminalConfig.fontFamily,
		fontSize: terminalConfig.fontSize,
		fontWeight: toFontWeight(terminalConfig.fontWeight),
		lineHeight: terminalConfig.lineHeight,
		letterSpacing: terminalConfig.letterSpacing,
		rescaleOverlappingGlyphs: true,
		scrollback: terminalConfig.scrollback,
		smoothScrollDuration: 0,
		theme: createTerminalTheme(terminalConfig.theme),
	};
}

export function applyTerminalOptions(
	terminal: {
		options: ITerminalOptions;
	},
	terminalConfig: TerminalConfig,
) {
	const next = buildTerminalOptions(terminalConfig);
	terminal.options.allowProposedApi = next.allowProposedApi;
	terminal.options.cursorBlink = next.cursorBlink;
	terminal.options.customGlyphs = next.customGlyphs;
	terminal.options.fontFamily = next.fontFamily;
	terminal.options.fontSize = next.fontSize;
	terminal.options.fontWeight = next.fontWeight;
	terminal.options.lineHeight = next.lineHeight;
	terminal.options.letterSpacing = next.letterSpacing;
	terminal.options.rescaleOverlappingGlyphs = next.rescaleOverlappingGlyphs;
	terminal.options.scrollback = next.scrollback;
	terminal.options.smoothScrollDuration = next.smoothScrollDuration;
	terminal.options.theme = next.theme as ITheme;
}
