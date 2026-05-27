import { useTerminalStore } from "@client/features/terminal/store";
import {
	applyTerminalOptions,
	buildTerminalOptions,
} from "@client/features/terminal/terminal-options";
import { mainProcess } from "@client/rpc";
import { useSelectedWorktreePath } from "@client/store";
import { useConfigStore, useTerminalConfig } from "@client/store/config-store";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef } from "react";

type UseTerminalOptions = {
	containerRef: React.RefObject<HTMLDivElement | null>;
};

export function useTerminal({ containerRef }: UseTerminalOptions) {
	const terminalRef = useRef<Terminal | null>(null);
	const fitAddonRef = useRef<FitAddon | null>(null);
	const terminalConfig = useTerminalConfig();
	const selectedWorktreePath = useSelectedWorktreePath();
	const openedRef = useRef(false);
	const skipWorktreeRestartRef = useRef(true);
	const dimensionsRef = useRef({ cols: 80, rows: 24 });

	const fitAndSyncSize = useCallback(() => {
		const fitAddon = fitAddonRef.current;
		const terminal = terminalRef.current;
		if (!fitAddon || !terminal) {
			return dimensionsRef.current;
		}

		fitAddon.fit();
		const dimensions = {
			cols: terminal.cols,
			rows: terminal.rows,
		};
		dimensionsRef.current = dimensions;
		return dimensions;
	}, []);

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

		terminalRef.current = terminal;
		fitAddonRef.current = fitAddon;

		const setWriter = useTerminalStore.getState().setWriter;
		const setExitHandler = useTerminalStore.getState().setExitHandler;

		setWriter((data) => {
			terminal.write(data);
		});
		setExitHandler((exitCode) => {
			terminal.write(
				`\r\n\x1b[90m[Process exited with code ${exitCode}]\x1b[0m\r\n`,
			);
		});

		const resizeObserver = new ResizeObserver(() => {
			const dimensions = fitAndSyncSize();
			if (openedRef.current) {
				mainProcess.resizeTerminal(dimensions.cols, dimensions.rows);
			}
		});
		resizeObserver.observe(container);

		const onData = terminal.onData((data) => {
			mainProcess.writeTerminalInput(data);
		});

		const openTerminal = () => {
			const dimensions = fitAndSyncSize();
			mainProcess.openTerminal(dimensions.cols, dimensions.rows);
			openedRef.current = true;
			terminal.focus();
		};

		requestAnimationFrame(openTerminal);

		return () => {
			openedRef.current = false;
			resizeObserver.disconnect();
			onData.dispose();
			setWriter(null);
			setExitHandler(null);
			terminal.dispose();
			terminalRef.current = null;
			fitAddonRef.current = null;
		};
	}, [containerRef, fitAndSyncSize]);

	useEffect(() => {
		const terminal = terminalRef.current;
		if (!terminal) {
			return;
		}

		applyTerminalOptions(terminal, terminalConfig);
		fitAndSyncSize();
	}, [terminalConfig, fitAndSyncSize]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect must re-run when worktree selection changes
	useEffect(() => {
		if (!openedRef.current) {
			return;
		}

		if (skipWorktreeRestartRef.current) {
			skipWorktreeRestartRef.current = false;
			return;
		}

		const terminal = terminalRef.current;
		if (!terminal) {
			return;
		}

		const dimensions = fitAndSyncSize();
		terminal.reset();
		terminal.write(
			"\r\n\x1b[33m●\x1b[0m Restarting shell in selected worktree…\r\n",
		);
		mainProcess.restartTerminal(dimensions.cols, dimensions.rows);
	}, [selectedWorktreePath, fitAndSyncSize]);

	return { terminalRef };
}
