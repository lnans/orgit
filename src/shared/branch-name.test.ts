import { describe, expect, test } from "bun:test";
import {
	NORMALIZE_BRANCH_NAME_ERROR_REASONS,
	normalizeBranchName,
	normalizeBranchNameErrorI18nKey,
} from "./branch-name";

describe("NORMALIZE_BRANCH_NAME_ERROR_REASONS", () => {
	test("lists every error reason", () => {
		expect(NORMALIZE_BRANCH_NAME_ERROR_REASONS).toEqual([
			"empty_input",
			"dot_segment",
			"starts_with_dot",
			"ends_with_dot",
			"ends_with_lock",
			"contains_at_brace",
			"empty_after_normalize",
		]);
	});
});

describe("normalizeBranchNameErrorI18nKey", () => {
	test("maps reason to locale key", () => {
		expect(normalizeBranchNameErrorI18nKey("empty_input")).toBe(
			"branchName.error.empty_input",
		);
	});
});

describe("normalizeBranchName", () => {
	test("returns trimmed input unchanged when valid", () => {
		expect(normalizeBranchName("feature/One")).toEqual({
			ok: true,
			value: "feature/One",
		});
		expect(normalizeBranchName("  release/v2.0  ")).toEqual({
			ok: true,
			value: "release/v2.0",
		});
	});

	test("preserves casing", () => {
		expect(normalizeBranchName("Feature/ABC")).toEqual({
			ok: true,
			value: "Feature/ABC",
		});
	});

	test("replaces forbidden characters without lowercasing", () => {
		expect(normalizeBranchName("feature branch")).toEqual({
			ok: true,
			value: "feature-branch",
		});
		expect(normalizeBranchName("fix:bug*")).toEqual({
			ok: true,
			value: "fix-bug",
		});
	});

	test("rejects dot-only segments", () => {
		expect(normalizeBranchName("..")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
		expect(normalizeBranchName("feature/..")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
	});

	test("rejects empty path segments and lone dot segments", () => {
		expect(normalizeBranchName("feature//fix")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
		expect(normalizeBranchName("feature/")).toEqual({
			ok: false,
			error: { reason: "dot_segment" },
		});
	});

	test("rejects leading slash and dot-prefixed segments", () => {
		expect(normalizeBranchName("/feature")).toEqual({
			ok: false,
			error: { reason: "starts_with_dot" },
		});
		expect(normalizeBranchName(".feature")).toEqual({
			ok: false,
			error: { reason: "starts_with_dot" },
		});
		expect(normalizeBranchName("feature/.hidden")).toEqual({
			ok: false,
			error: { reason: "starts_with_dot" },
		});
	});

	test("rejects @{ in branch names", () => {
		expect(normalizeBranchName("foo@{bar}")).toEqual({
			ok: false,
			error: { reason: "contains_at_brace" },
		});
	});

	test("rejects names ending with .lock", () => {
		expect(normalizeBranchName("main.lock")).toEqual({
			ok: false,
			error: { reason: "ends_with_lock" },
		});
	});

	test("returns error for empty input", () => {
		expect(normalizeBranchName("")).toEqual({
			ok: false,
			error: { reason: "empty_input" },
		});
	});
});
