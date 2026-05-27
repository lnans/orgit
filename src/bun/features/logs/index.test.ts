import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CONFIG_DIR, LOG_FILE } from "../app-state/paths";
import { readLogFile } from "./index";

describe("readLogFile", () => {
	const backup = existsSync(LOG_FILE) ? readLogFile() : null;

	afterEach(() => {
		if (backup === null) {
			if (existsSync(LOG_FILE)) {
				rmSync(LOG_FILE);
			}
			return;
		}

		mkdirSync(CONFIG_DIR, { recursive: true });
		writeFileSync(LOG_FILE, backup, "utf-8");
	});

	test("returns empty string when the log file is missing", () => {
		if (existsSync(LOG_FILE)) {
			rmSync(LOG_FILE);
		}

		expect(readLogFile()).toBe("");
	});

	test("returns file contents when present", () => {
		mkdirSync(CONFIG_DIR, { recursive: true });
		writeFileSync(LOG_FILE, "line one\nline two\n", "utf-8");

		expect(readLogFile()).toBe("line one\nline two\n");
		expect(path.basename(LOG_FILE)).toBe("orgit.log");
	});
});
