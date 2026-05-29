import { createXtermInstance } from "@client/features/terminal/lib/create-xterm";
import { fitTerminalDimensions } from "@client/features/terminal/lib/fit-terminal";
import { applyTerminalOptions } from "@client/features/terminal/lib/options";
import { useTerminalStore } from "@client/features/terminal/store";
import { mainProcess } from "@client/rpc";
import { useConfigStore, useTerminalConfig } from "@client/store/config-store";
import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef } from "react";

type UseTerminalSessionOptions = {
	sessionId: string;
	cwd: string;
	active: boolean;
	containerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Manages one xterm instance: create/dispose, fit/resize, RPC attach/write.
 * Inactive tabs stay mounted but only the active tab attaches to the PTY backend.
 */
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
		const dimensions = fitTerminalDimensions(
			fitAddonRef.current,
			terminalRef.current,
			containerRef.current,
			dimensionsRef.current,
		);
		if (fitAddonRef.current && terminalRef.current) {
			dimensionsRef.current = dimensions;
		}
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

		const { terminal, fitAddon, dispose } = createXtermInstance(
			container,
			useConfigStore.getState().config.terminal,
			{
				onData: (data) => {
					mainProcess.writeTerminalInput(sessionId, data);
				},
			},
		);

		terminalRef.current = terminal;
		fitAddonRef.current = fitAddon;

		const { registerSession, unregisterSession } = useTerminalStore.getState();

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
			resizeObserver.disconnect();
			unregisterSession(sessionId);
			mainProcess.closeTerminal(sessionId);
			dispose();
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
