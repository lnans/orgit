export { TerminalPanel } from "./components/terminal-panel";
export { TerminalSessionView } from "./components/terminal-session";
export { TerminalTabBar } from "./components/terminal-tab-bar";
export { createXtermInstance } from "./lib/create-xterm";
export { fitTerminalDimensions } from "./lib/fit-terminal";
export { resolveNextActiveTabId } from "./lib/tab-selection";
export {
	useActiveTerminalTabId,
	useAllTerminalTabs,
	useTerminalStore,
	useWorktreeTerminalTabs,
} from "./store";
