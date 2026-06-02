import type {
	OpenWorktreeInIdeParams,
	WorktreeHasDotNetSolutionParams,
	WorktreeHasDotNetSolutionResult,
} from "../../../shared/worktree-ide";
import { worktreeHasDotNetSolution } from "./lib/find-dotnet-solution";
import { openInCode } from "./lib/open-in-code";
import { openInRider } from "./lib/open-in-rider";

export {
	findDotNetSolutionFile,
	worktreeHasDotNetSolution,
} from "./lib/find-dotnet-solution";

export function checkWorktreeHasDotNetSolution(
	params: WorktreeHasDotNetSolutionParams,
): WorktreeHasDotNetSolutionResult {
	return { hasSolution: worktreeHasDotNetSolution(params.worktreePath) };
}

export function openWorktreeInCode(params: OpenWorktreeInIdeParams): void {
	openInCode(params.worktreePath);
}

export function openWorktreeInRider(params: OpenWorktreeInIdeParams): void {
	openInRider(params.worktreePath);
}
