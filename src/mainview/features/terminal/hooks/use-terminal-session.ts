import { useTerminalStore } from "@client/features/terminal/store";
import {
	applyTerminalOptions,
	buildTerminalOptions,
} from "@client/features/terminal/terminal-options";
import {
	installAlternateBufferViewportGuards,
	scheduleAlternateBufferViewportSync,
	snapTerminalContainerHeight,
	syncAlternateBufferViewport,
} from "@client/features/terminal/terminal-viewport";
import { loadWebglAddon } from "@client/features/terminal/terminal-webgl";
import { mainProcess } from "@client/rpc";
import { useConfigStore, useTerminalConfig } from "@client/store/config-store";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef } from "react";

type UseTerminalSessionOptions = {
	sessionId: string;
	cwd: string;
	active: boolean;
	containerRef: React.RefObject<HTMLDivElement | null>;
};

export function useTerminalSession({
	sessionId,
	cwd,
	active,
	containerRef,
}: UseTerminalSessionOptions) {
	const terminalRef = useRef<Terminal | null>(null);
	const fitAddonRef = useRef<FitAddon | null>(null);
	const terminalConfig = useTerminalConfig();
	const readyRef = useRef(false);
	const activeRef = useRef(active);
	const dimensionsRef = useRef({ cols: 80, rows: 24 });

	useEffect(() => {
		activeRef.current = active;
	}, [active]);

	const fitAndSyncSize = useCallback(() => {
		const fitAddon = fitAddonRef.current;
		const terminal = terminalRef.current;
		const container = containerRef.current;
		if (!fitAddon || !terminal) {
			return dimensionsRef.current;
		}

		fitAddon.fit();
		if (container && snapTerminalContainerHeight(terminal, container)) {
			fitAddon.fit();
		}
		syncAlternateBufferViewport(terminal);

		const dimensions = {
			cols: terminal.cols,
			rows: terminal.rows,
		};
		dimensionsRef.current = dimensions;
		return dimensions;
	}, [containerRef]);

	const attachToBackend = useCallback(() => {
		const terminal = terminalRef.current;
		if (!terminal || !readyRef.current || !activeRef.current) {
			return;
		}

		const dimensions = fitAndSyncSize();
		mainProcess.attachTerminal(
			sessionId,
			cwd,
			dimensions.cols,
			dimensions.rows,
		);
		terminal.focus();
	}, [sessionId, cwd, fitAndSyncSize]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const terminal = new Terminal(
			buildTerminalOptions(useConfigStore.getState().config.terminal),
		);
		const fitAddon = new FitAddon();
		const webLinksAddon = new WebLinksAddon();

		terminal.loadAddon(fitAddon);
		terminal.loadAddon(webLinksAddon);
		terminal.open(container);

		const disposeWebgl = loadWebglAddon(terminal);

		terminalRef.current = terminal;
		fitAddonRef.current = fitAddon;

		const { registerSession, unregisterSession } = useTerminalStore.getState();

		const disposeViewportGuards =
			installAlternateBufferViewportGuards(terminal);

		registerSession(sessionId, {
			write: (data) => {
				terminal.write(data);
			},
			onExit: (exitCode) => {
				terminal.write(
					`\r\n\x1b[90m[Process exited with code ${exitCode}]\x1b[0m\r\n`,
				);
			},
		});

		const onData = terminal.onData((data) => {
			if (data.includes("/reset")) {
				scheduleAlternateBufferViewportSync(terminal);
			}
			mainProcess.writeTerminalInput(sessionId, data);
		});

		const resizeObserver = new ResizeObserver(() => {
			if (!activeRef.current) {
				return;
			}
			const dimensions = fitAndSyncSize();
			if (readyRef.current) {
				mainProcess.resizeTerminal(dimensions.cols, dimensions.rows);
			}
		});
		resizeObserver.observe(container);

		requestAnimationFrame(() => {
			readyRef.current = true;
			if (activeRef.current) {
				attachToBackend();
			}
		});

		return () => {
			readyRef.current = false;
			container.style.height = "";
			resizeObserver.disconnect();
			onData.dispose();
			disposeWebgl();
			disposeViewportGuards();
			unregisterSession(sessionId);
			mainProcess.closeTerminal(sessionId);
			terminal.dispose();
			terminalRef.current = null;
			fitAddonRef.current = null;
		};
	}, [sessionId, containerRef, fitAndSyncSize, attachToBackend]);

	useEffect(() => {
		const terminal = terminalRef.current;
		if (!terminal) {
			return;
		}

		applyTerminalOptions(terminal, terminalConfig);
		if (active) {
			fitAndSyncSize();
		}
	}, [terminalConfig, active, fitAndSyncSize]);

	useEffect(() => {
		if (!active || !terminalRef.current || !readyRef.current) {
			return;
		}
		attachToBackend();
	}, [active, attachToBackend]);

	return { terminalRef };
}
