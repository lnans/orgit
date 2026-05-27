import type { TerminalConfig } from "@shared/config";
import type { ITerminalOptions, ITheme } from "@xterm/xterm";
import { createTerminalTheme } from "./terminal-theme";

export function buildTerminalOptions(
	terminalConfig: TerminalConfig,
): ITerminalOptions {
	return {
		cursorBlink: terminalConfig.cursorBlink,
		fontFamily: terminalConfig.fontFamily,
		fontSize: terminalConfig.fontSize,
		fontWeight: terminalConfig.fontWeight,
		lineHeight: terminalConfig.lineHeight,
		letterSpacing: terminalConfig.letterSpacing,
		scrollback: terminalConfig.scrollback,
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
	terminal.options.cursorBlink = next.cursorBlink;
	terminal.options.fontFamily = next.fontFamily;
	terminal.options.fontSize = next.fontSize;
	terminal.options.fontWeight = next.fontWeight;
	terminal.options.lineHeight = next.lineHeight;
	terminal.options.letterSpacing = next.letterSpacing;
	terminal.options.scrollback = next.scrollback;
	terminal.options.theme = next.theme as ITheme;
}
