import { describe, expect, test } from "bun:test";
import { formatLocalDateTime } from "./logger";

describe("formatLocalDateTime", () => {
	test("formats using local wall-clock fields", () => {
		const formatted = formatLocalDateTime(new Date(2026, 4, 27, 15, 4, 5, 6));

		expect(formatted).toBe("2026-05-27 15:04:05.006");
	});
});
