import { describe, expect, test } from "bun:test";
import { getDefaultShell, getShellArgs } from "./shell";

describe("getShellArgs", () => {
	test("uses login flag for zsh and bash", () => {
		expect(getShellArgs("/bin/zsh")).toEqual(["-l"]);
		expect(getShellArgs("/usr/local/bin/bash")).toEqual(["-l"]);
	});

	test("uses no args for other shells", () => {
		expect(getShellArgs("/bin/fish")).toEqual([]);
	});
});

describe("getDefaultShell", () => {
	test("returns a non-empty shell path", () => {
		expect(getDefaultShell().length).toBeGreaterThan(0);
	});
});
