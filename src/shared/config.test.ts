import { describe, expect, test } from "bun:test";
import { DEFAULT_TERMINAL_CONFIG, parseAppConfig } from "./config";

describe("parseAppConfig", () => {
	test("returns defaults for invalid input", () => {
		const config = parseAppConfig(null);
		expect(config.terminal.fontSize).toBe(DEFAULT_TERMINAL_CONFIG.fontSize);
		expect(config.terminal.theme.background).toBe("#282a36");
		expect(config.terminal.fontFamily).toContain("FiraCode Nerd Font");
	});

	test("parses terminal appearance options", () => {
		const config = parseAppConfig({
			version: 1,
			terminal: {
				fontFamily: "JetBrains Mono",
				fontSize: 14,
				lineHeight: 1.4,
				cursorBlink: false,
				theme: {
					background: "#000000",
					foreground: "#ffffff",
				},
			},
		});

		expect(config.terminal.fontFamily).toBe("JetBrains Mono");
		expect(config.terminal.fontSize).toBe(14);
		expect(config.terminal.lineHeight).toBe(1.4);
		expect(config.terminal.cursorBlink).toBe(false);
		expect(config.terminal.theme.background).toBe("#000000");
		expect(config.terminal.theme.foreground).toBe("#ffffff");
	});

	test("ignores invalid numeric values", () => {
		const config = parseAppConfig({
			terminal: { fontSize: -1, scrollback: 0 },
		});
		expect(config.terminal.fontSize).toBe(DEFAULT_TERMINAL_CONFIG.fontSize);
		expect(config.terminal.scrollback).toBe(DEFAULT_TERMINAL_CONFIG.scrollback);
	});
});
