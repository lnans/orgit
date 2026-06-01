import { describe, expect, test } from "bun:test";
import {
	encodeBranchNameForFolderSegment,
	formatWorktreeFolderName,
	maxWorktreeCheckoutSegmentLength,
	resolveWorktreeCheckout,
} from "./worktree-checkout";

describe("encodeBranchNameForFolderSegment", () => {
	test("leaves branch names without underscores unchanged aside from slash and dash", () => {
		expect(encodeBranchNameForFolderSegment("Feature/One")).toBe(
			"Feature_slash_One",
		);
		expect(encodeBranchNameForFolderSegment("a/b")).toBe("a_slash_b");
		expect(encodeBranchNameForFolderSegment("a-b")).toBe("a_dash_b");
	});

	test("maps literal marker-like segments and encoded slashes injectively", () => {
		expect(encodeBranchNameForFolderSegment("a/b")).toBe("a_slash_b");
		expect(encodeBranchNameForFolderSegment("a_slash_b")).toBe(
			"a_underscore_slash_underscore_b",
		);
		expect(encodeBranchNameForFolderSegment("a-b")).toBe("a_dash_b");
		expect(encodeBranchNameForFolderSegment("a_dash_b")).toBe(
			"a_underscore_dash_underscore_b",
		);
	});
});

describe("resolveWorktreeCheckout", () => {
	test("returns branch and folder for valid hierarchical branch", () => {
		expect(resolveWorktreeCheckout("Feature/One")).toEqual({
			ok: true,
			branchName: "Feature/One",
			folderName: "feature_slash_one",
		});
	});

	test("maps slash and dash branches to distinct folder segments", () => {
		expect(resolveWorktreeCheckout("a/b")).toEqual({
			ok: true,
			branchName: "a/b",
			folderName: "a_slash_b",
		});
		expect(resolveWorktreeCheckout("a-b")).toEqual({
			ok: true,
			branchName: "a-b",
			folderName: "a_dash_b",
		});
	});

	test("maps literal underscore marker segments away from slash-encoded folders", () => {
		expect(resolveWorktreeCheckout("a_slash_b")).toEqual({
			ok: true,
			branchName: "a_slash_b",
			folderName: "a_underscore_slash_underscore_b",
		});
	});

	test("rejects folder names longer than 255 characters", () => {
		expect(resolveWorktreeCheckout("x".repeat(300))).toEqual({
			ok: false,
			error: { field: "folder", reason: "name_too_long" },
		});
	});

	test("caps branch-derived segment when repository basename is provided", () => {
		const repositoryBasename = "my-repo";
		const maxSegment = maxWorktreeCheckoutSegmentLength(repositoryBasename);
		expect(maxSegment).toBe(255 - repositoryBasename.length - 1);

		const branchSegment = "a".repeat(maxSegment);
		expect(
			resolveWorktreeCheckout(branchSegment, { repositoryBasename }),
		).toEqual({
			ok: true,
			branchName: branchSegment,
			folderName: branchSegment,
		});
		expect(
			formatWorktreeFolderName(repositoryBasename, branchSegment).length,
		).toBe(255);

		expect(
			resolveWorktreeCheckout("a".repeat(maxSegment + 1), {
				repositoryBasename,
			}),
		).toEqual({
			ok: false,
			error: {
				field: "folder",
				reason: "worktree_combined_name_too_long",
				maxSegmentLength: maxSegment,
			},
		});
	});

	test("rejects when repository basename leaves no room for a segment", () => {
		expect(
			resolveWorktreeCheckout("feature", {
				repositoryBasename: "x".repeat(255),
			}),
		).toEqual({
			ok: false,
			error: {
				field: "folder",
				reason: "worktree_combined_name_too_long",
				maxSegmentLength: 0,
			},
		});
	});

	test("rejects invalid branch names", () => {
		expect(resolveWorktreeCheckout("..")).toEqual({
			ok: false,
			error: { field: "branch", reason: "dot_segment" },
		});
	});

	test("rejects names with only invalid characters", () => {
		expect(resolveWorktreeCheckout("***")).toEqual({
			ok: false,
			error: { field: "branch", reason: "empty_after_normalize" },
		});
	});
});
