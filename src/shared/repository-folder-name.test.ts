import { describe, expect, test } from "bun:test";
import { deriveRepositoryFolderName } from "./repository-folder-name";

describe("deriveRepositoryFolderName", () => {
	test("uses last URL segment without .git", () => {
		expect(
			deriveRepositoryFolderName("https://github.com/org/my-app.git"),
		).toEqual({
			ok: true,
			value: "my-app",
		});
	});

	test("handles scp-style git URLs", () => {
		expect(deriveRepositoryFolderName("git@github.com:org/my-app.git")).toEqual(
			{
				ok: true,
				value: "my-app",
			},
		);
	});

	test("handles file URLs", () => {
		expect(
			deriveRepositoryFolderName("file:///tmp/workspaces/demo.git"),
		).toEqual({
			ok: true,
			value: "demo",
		});
	});

	test("handles Windows filesystem paths", () => {
		expect(deriveRepositoryFolderName("C:\\dev\\my-repo.git")).toEqual({
			ok: true,
			value: "my-repo",
		});
		expect(deriveRepositoryFolderName("C:/dev/my-repo.git")).toEqual({
			ok: true,
			value: "my-repo",
		});
	});
});
