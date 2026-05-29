import { describe, expect, test } from "bun:test";
import type { AppState } from "../../../shared/types";
import { reconcileAppState } from "./reconcile";

function baseState(overrides: Partial<AppState> = {}): AppState {
	return {
		version: 1,
		workspacePath: "/ws",
		selectedWorktreePaths: {},
		repositories: [],
		...overrides,
	};
}

describe("reconcileAppState", () => {
	test("preserves selections while repositories are not loaded", () => {
		const state = baseState({
			selectedRepositoryPath: "/ws/repo",
			selectedWorktreePaths: {
				"/ws/repo": "/ws/repo/wt-a",
			},
			repositories: [],
		});

		expect(reconcileAppState(state)).toEqual(state);
	});

	test("clears selected repository when it no longer exists", () => {
		const state = baseState({
			selectedRepositoryPath: "/ws/gone",
			repositories: [
				{ name: "kept", path: "/ws/kept", branch: "main", worktrees: [] },
			],
		});

		expect(reconcileAppState(state).selectedRepositoryPath).toBeUndefined();
	});

	test("prunes stale worktree selection for removed repository", () => {
		const state = baseState({
			selectedWorktreePaths: {
				"/ws/gone": "/ws/gone/wt",
				"/ws/kept": "/ws/kept/wt-a",
			},
			repositories: [
				{
					name: "kept",
					path: "/ws/kept",
					branch: "main",
					worktrees: [
						{
							name: "wt-a",
							path: "/ws/kept/wt-a",
							filesModified: 0,
							linesAdded: 0,
							linesRemoved: 0,
						},
					],
				},
			],
		});

		expect(reconcileAppState(state).selectedWorktreePaths).toEqual({
			"/ws/kept": "/ws/kept/wt-a",
		});
	});

	test("clears worktree selection when path is no longer valid", () => {
		const state = baseState({
			selectedRepositoryPath: "/ws/repo",
			selectedWorktreePaths: {
				"/ws/repo": "/ws/repo/old-wt",
			},
			repositories: [
				{
					name: "repo",
					path: "/ws/repo",
					branch: "main",
					worktrees: [
						{
							name: "new",
							path: "/ws/repo/new-wt",
							filesModified: 0,
							linesAdded: 0,
							linesRemoved: 0,
						},
					],
				},
			],
		});

		expect(reconcileAppState(state).selectedWorktreePaths).toEqual({});
	});

	test("matches persisted paths after path.resolve normalization", () => {
		const state = baseState({
			selectedRepositoryPath: "/ws/./repo",
			selectedWorktreePaths: {
				"/ws/repo": "/ws/repo/../repo/wt-a",
			},
			repositories: [
				{
					name: "repo",
					path: "/ws/repo",
					branch: "main",
					worktrees: [
						{
							name: "wt-a",
							path: "/ws/repo/wt-a",
							filesModified: 0,
							linesAdded: 0,
							linesRemoved: 0,
						},
					],
				},
			],
		});

		expect(reconcileAppState(state).selectedWorktreePaths).toEqual({
			"/ws/repo": "/ws/repo/wt-a",
		});
	});

	test("normalizes branch name selections to worktree paths", () => {
		const state = baseState({
			selectedRepositoryPath: "/ws/repo",
			selectedWorktreePaths: {
				"/ws/repo": "feature/my-branch",
			},
			repositories: [
				{
					name: "repo",
					path: "/ws/repo",
					branch: "main",
					worktrees: [
						{
							name: "feature/my-branch",
							path: "/ws/repo/feature-checkout",
							filesModified: 0,
							linesAdded: 0,
							linesRemoved: 0,
						},
					],
				},
			],
		});

		expect(reconcileAppState(state).selectedWorktreePaths).toEqual({
			"/ws/repo": "/ws/repo/feature-checkout",
		});
	});
});
