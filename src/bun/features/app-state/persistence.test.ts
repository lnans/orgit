import { describe, expect, test } from "bun:test";
import { PERSISTED_STATE_VERSION } from "../../../shared/types";
import { parsePersistedState } from "./persistence";

describe("parsePersistedState", () => {
	test("returns defaults for invalid input", () => {
		expect(parsePersistedState(null)).toEqual({
			version: PERSISTED_STATE_VERSION,
			workspacePath: expect.any(String),
			selectedWorktreePaths: {},
		});
	});

	test("migrates legacy state without version field", () => {
		expect(
			parsePersistedState({
				workspacePath: "/tmp/workspace",
				selectedRepositoryPath: "/tmp/workspace/my-repo",
				selectedWorktreePaths: {
					"/tmp/workspace/my-repo": "/tmp/workspace/my-repo-feature",
				},
			}),
		).toEqual({
			version: PERSISTED_STATE_VERSION,
			workspacePath: "/tmp/workspace",
			selectedRepositoryPath: "/tmp/workspace/my-repo",
			selectedWorktreePaths: {
				"/tmp/workspace/my-repo": "/tmp/workspace/my-repo-feature",
			},
		});
	});

	test("drops invalid worktree path entries", () => {
		expect(
			parsePersistedState({
				version: 1,
				workspacePath: "/ws",
				selectedWorktreePaths: {
					"/repo": "",
					"/other": null,
					"/ok": "/wt",
				},
			}),
		).toEqual({
			version: PERSISTED_STATE_VERSION,
			workspacePath: "/ws",
			selectedWorktreePaths: {
				"/ok": "/wt",
			},
		});
	});
});
