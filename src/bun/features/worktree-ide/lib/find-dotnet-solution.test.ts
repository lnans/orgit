import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	findDotNetSolutionFile,
	worktreeHasDotNetSolution,
} from "./find-dotnet-solution";

let tempDir = "";

beforeEach(() => {
	tempDir = mkdtempSync(path.join(tmpdir(), "orgit-dotnet-solution-"));
});

afterEach(() => {
	rmSync(tempDir, { recursive: true, force: true });
});

test("findDotNetSolutionFile returns null when no solution exists", () => {
	mkdirSync(path.join(tempDir, "src"), { recursive: true });
	writeFileSync(path.join(tempDir, "src", "Program.cs"), "class Program {}");

	expect(findDotNetSolutionFile(tempDir)).toBeNull();
	expect(worktreeHasDotNetSolution(tempDir)).toBe(false);
});

test("findDotNetSolutionFile finds .sln at repo root", () => {
	writeFileSync(
		path.join(tempDir, "App.sln"),
		"Microsoft Visual Studio Solution File",
	);

	expect(findDotNetSolutionFile(tempDir)).toBe(path.join(tempDir, "App.sln"));
});

test("findDotNetSolutionFile finds .slnx nested and skips node_modules", () => {
	const nested = path.join(tempDir, "src", "Backend");
	mkdirSync(nested, { recursive: true });
	writeFileSync(path.join(nested, "Backend.slnx"), "solution");

	const ignored = path.join(tempDir, "node_modules", "pkg");
	mkdirSync(ignored, { recursive: true });
	writeFileSync(path.join(ignored, "Ignored.sln"), "should not match");

	expect(findDotNetSolutionFile(tempDir)).toBe(
		path.join(nested, "Backend.slnx"),
	);
});
