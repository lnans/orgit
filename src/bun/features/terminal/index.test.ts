import { describe, expect, test } from "bun:test";
import { homedir } from "node:os";
import { resolveTerminalCwd } from "./index";

describe("resolveTerminalCwd", () => {
	test("prefers worktree over workspace", () => {
		expect(resolveTerminalCwd("/workspace", "/workspace/feature-a")).toBe(
			"/workspace/feature-a",
		);
	});

	test("falls back to workspace then home", () => {
		expect(resolveTerminalCwd("/workspace", undefined)).toBe("/workspace");
		expect(resolveTerminalCwd("", undefined)).toBe(homedir());
	});
});
