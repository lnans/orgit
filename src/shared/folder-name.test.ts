import { describe, expect, test } from "bun:test";
import {
	NORMALIZE_FOLDER_NAME_ERROR_REASONS,
	normalizeFolderName,
	normalizeFolderNameErrorI18nKey,
} from "./folder-name";

describe("NORMALIZE_FOLDER_NAME_ERROR_REASONS", () => {
	test("lists every error reason", () => {
		expect(NORMALIZE_FOLDER_NAME_ERROR_REASONS).toEqual([
			"empty_input",
			"dot_segment",
			"empty_after_normalize",
			"name_too_long",
		]);
	});
});

describe("normalizeFolderNameErrorI18nKey", () => {
	test("maps reason to locale key", () => {
		expect(normalizeFolderNameErrorI18nKey("empty_input")).toBe(
			"folderName.error.empty_input",
		);
	});
});

describe("normalizeFolderName", () => {
	test("returns ok with trimmed lowercase input when already valid", () => {
		expect(normalizeFolderName("my-feature")).toEqual({
			ok: true,
			value: "my-feature",
		});
		expect(normalizeFolderName("  My-Feature  ")).toEqual({
			ok: true,
			value: "my-feature",
		});
	});

	test("replaces invalid characters", () => {
		expect(normalizeFolderName("foo/bar:baz*")).toEqual({
			ok: true,
			value: "foo-bar-baz",
		});
		expect(normalizeFolderName('a<b>c|d?e"f\\g')).toEqual({
			ok: true,
			value: "a-b-c-d-e-f-g",
		});
		expect(normalizeFolderName("a\u0001b")).toEqual({ ok: true, value: "a-b" });
	});

	test("collapses repeated replacements", () => {
		expect(normalizeFolderName("a///b", { replacement: "-" })).toEqual({
			ok: true,
			value: "a-b",
		});
	});

	test("strips trailing dots and spaces", () => {
		expect(normalizeFolderName("name. ")).toEqual({ ok: true, value: "name" });
		expect(normalizeFolderName("name...")).toEqual({ ok: true, value: "name" });
	});

	test("rejects dot-only names", () => {
		expect(normalizeFolderName(".")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
		expect(normalizeFolderName("..")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
	});

	test("suffixes Windows reserved names", () => {
		expect(normalizeFolderName("CON")).toEqual({ ok: true, value: "con_" });
		expect(normalizeFolderName("COM1")).toEqual({ ok: true, value: "com1_" });
		expect(normalizeFolderName("NUL.txt")).toEqual({
			ok: true,
			value: "nul.txt_",
		});
	});

	test("returns error for empty or whitespace-only input", () => {
		expect(normalizeFolderName("")).toEqual({
			ok: false,
			error: { reason: "empty_input" },
		});
		expect(normalizeFolderName("   ")).toEqual({
			ok: false,
			error: { reason: "empty_input" },
		});
	});

	test("returns error when only invalid characters remain", () => {
		expect(normalizeFolderName("***", { replacement: "-" })).toEqual({
			ok: false,
			error: { reason: "empty_after_normalize" },
		});
	});

	test("rejects names longer than max length", () => {
		expect(normalizeFolderName("a".repeat(300), { maxLength: 10 })).toEqual({
			ok: false,
			error: { reason: "name_too_long" },
		});
	});

	test("lowercases unicode letters", () => {
		expect(normalizeFolderName("Café-Été")).toEqual({
			ok: true,
			value: "café-été",
		});
	});
});
