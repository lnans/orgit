import { describe, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { runCmdSync } from "@/server/features/process";

const cwd = tmpdir();
const runtime = process.execPath;

describe("runCmdSync", () => {
	test("returns trimmed stdout on success", () => {
		const result = runCmdSync(cwd, runtime, "-e", "console.log('  hello world  ')");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBe("hello world");
		}
	});

	test("returns stderr as error when process exits non-zero", () => {
		const result = runCmdSync(
			cwd,
			runtime,
			"-e",
			"console.error('fatal: not a git repository'); process.exit(128)",
		);

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBeInstanceOf(Error);
			expect((result.error as Error).message).toBe("fatal: not a git repository");
		}
	});

	test("returns exit code message when stderr is empty", () => {
		const result = runCmdSync(cwd, runtime, "-e", "process.exit(1)");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect((result.error as Error).message).toBe("Process exited with code 1");
		}
	});
});
