import type { TerminalConfig } from "@shared/config";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import type { Terminal } from "@xterm/xterm";
import { Terminal as XTerm } from "@xterm/xterm";
import { buildTerminalOptions } from "./options";
import {
	installAlternateBufferViewportGuards,
	scheduleAlternateBufferViewportSync,
} from "./viewport";
import { loadWebglAddon } from "./webgl";

export type XtermSessionHandlers = {
	onData: (data: string) => void;
};

export type XtermInstance = {
	terminal: Terminal;
	fitAddon: FitAddon;
};

/**
 * Creates an xterm instance with fit, web links, WebGL, and alternate-buffer
 * viewport guards. Caller owns mount (open) and cleanup (dispose).
 */
export function createXtermInstance(
	container: HTMLElement,
	terminalConfig: TerminalConfig,
	handlers: XtermSessionHandlers,
): XtermInstance & { dispose: () => void } {
	const terminal = new XTerm(buildTerminalOptions(terminalConfig));
	const fitAddon = new FitAddon();
	const webLinksAddon = new WebLinksAddon();

	terminal.loadAddon(fitAddon);
	terminal.loadAddon(webLinksAddon);
	terminal.open(container);

	const disposeWebgl = loadWebglAddon(terminal);
	const disposeViewportGuards = installAlternateBufferViewportGuards(terminal);

	const onData = terminal.onData((data) => {
		if (data.includes("/reset")) {
			scheduleAlternateBufferViewportSync(terminal);
		}
		handlers.onData(data);
	});

	return {
		terminal,
		fitAddon,
		dispose: () => {
			onData.dispose();
			disposeWebgl();
			disposeViewportGuards();
			container.style.height = "";
			terminal.dispose();
		},
	};
}
