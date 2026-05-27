import { describe, expect, test } from "bun:test";
import {
	DEFAULT_TERMINAL_SESSION_KEY,
	getTerminalSessionKey,
} from "./terminal";

describe("getTerminalSessionKey", () => {
	test("uses worktree path when selected", () => {
		expect(getTerminalSessionKey("/workspace", "/workspace/feature")).toBe(
			"/workspace/feature",
		);
	});

	test("falls back to workspace then default session key", () => {
		expect(getTerminalSessionKey("/workspace", undefined)).toBe("/workspace");
		expect(getTerminalSessionKey("", undefined)).toBe(
			DEFAULT_TERMINAL_SESSION_KEY,
		);
	});
});
