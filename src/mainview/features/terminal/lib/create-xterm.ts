import type { TerminalConfig } from "@shared/config";
import { FitAddon } from "@xterm/addon-fit";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebLinksAddon } from "@xterm/addon-web-links";
import type { Terminal } from "@xterm/xterm";
import { Terminal as XTerm } from "@xterm/xterm";
import { buildTerminalOptions } from "./options";

export type XtermSessionHandlers = {
	onData: (data: string) => void;
};

export type XtermInstance = {
	terminal: Terminal;
	fitAddon: FitAddon;
};

/**
 * Creates an xterm instance with fit, web links, and Unicode 11 width rules.
 * Uses the DOM renderer (no WebGL) for reliable TUI box-drawing. Caller owns
 * mount (open) and cleanup (dispose).
 */
export function createXtermInstance(
	container: HTMLElement,
	terminalConfig: TerminalConfig,
	handlers: XtermSessionHandlers,
): XtermInstance & { dispose: () => void } {
	const terminal = new XTerm(buildTerminalOptions(terminalConfig));
	const fitAddon = new FitAddon();
	const webLinksAddon = new WebLinksAddon();
	const unicode11Addon = new Unicode11Addon();

	terminal.loadAddon(fitAddon);
	terminal.loadAddon(webLinksAddon);
	terminal.loadAddon(unicode11Addon);
	terminal.unicode.activeVersion = "11";

	terminal.open(container);

	const onData = terminal.onData((data) => {
		handlers.onData(data);
	});

	return {
		terminal,
		fitAddon,
		dispose: () => {
			onData.dispose();
			container.style.height = "";
			terminal.dispose();
		},
	};
}
