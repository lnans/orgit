import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { initLogSession, LOG_FILE, LOGS_DIR } from "../app-state/paths";
import { readLogFile } from "./index";

describe("readLogFile", () => {
	let sessionFile: string | undefined;
	let backup: string | null = null;

	beforeEach(() => {
		if (LOG_FILE && existsSync(LOG_FILE)) {
			backup = readLogFile();
		} else {
			backup = null;
		}

		sessionFile = initLogSession(new Date(2026, 5, 2, 10, 15, 30, 42));
	});

	afterEach(() => {
		if (sessionFile && existsSync(sessionFile)) {
			rmSync(sessionFile);
		}
		sessionFile = undefined;

		if (backup === null) {
			return;
		}

		mkdirSync(LOGS_DIR, { recursive: true });
		writeFileSync(LOG_FILE, backup, "utf-8");
	});

	test("returns empty string when the log file is missing", () => {
		if (existsSync(LOG_FILE)) {
			rmSync(LOG_FILE);
		}

		expect(readLogFile()).toBe("");
	});

	test("returns file contents when present", () => {
		writeFileSync(LOG_FILE, "line one\nline two\n", "utf-8");

		expect(readLogFile()).toBe("line one\nline two\n");
		expect(LOG_FILE).toStartWith(LOGS_DIR);
	});
});
