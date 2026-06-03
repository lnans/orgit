import { describe, expect, test } from "bun:test";
import type { RemoteBranchOption } from "@shared/list-remote-branches";
import {
	groupRemoteBranchesByFolder,
	remoteBranchItemLabel,
} from "./group-remote-branches-by-folder";

function branch(branchName: string): RemoteBranchOption {
	return { ref: `origin/${branchName}`, branchName };
}

describe("groupRemoteBranchesByFolder", () => {
	test("keeps slashless branches at the root", () => {
		const tree = groupRemoteBranchesByFolder([
			branch("develop"),
			branch("main"),
		]);
		expect(tree.branches.map((b) => b.branchName)).toEqual(["develop", "main"]);
		expect(tree.children).toEqual([]);
	});

	test("groups branches by top-level folder segment", () => {
		const tree = groupRemoteBranchesByFolder([
			branch("release/2.0"),
			branch("feature/x"),
			branch("release/1.0"),
		]);
		expect(tree.branches).toEqual([]);
		expect(tree.children.map((node) => node.name)).toEqual([
			"feature",
			"release",
		]);
		const release = tree.children.find((node) => node.name === "release");
		expect(release?.branches.map((b) => b.branchName)).toEqual([
			"release/1.0",
			"release/2.0",
		]);
	});

	test("nests deeper path segments as subfolders", () => {
		const tree = groupRemoteBranchesByFolder([branch("release/v1/hotfix")]);
		const release = tree.children.find((node) => node.name === "release");
		expect(release?.branches).toEqual([]);
		expect(release?.children.map((node) => node.name)).toEqual(["v1"]);
		expect(release?.children[0]?.branches[0]?.branchName).toBe(
			"release/v1/hotfix",
		);
	});
});

describe("remoteBranchItemLabel", () => {
	test("returns the last path segment within a group", () => {
		expect(remoteBranchItemLabel(branch("release/1.0"))).toBe("1.0");
		expect(remoteBranchItemLabel(branch("main"))).toBe("main");
	});
});
