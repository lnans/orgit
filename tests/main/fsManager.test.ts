import { EventEmitter } from "node:events";
import {
	chmod,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FsManager } from "@main/features/fsManager";
import type { Result } from "@main/features/result";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const fsMock = vi.hoisted(() => ({
	impl: null as ((path: string, options?: unknown) => EventEmitter) | null,
}));

vi.mock("node:fs", async (importOriginal) => {
	const actual = await importOriginal<typeof import("node:fs")>();
	return {
		...actual,
		createWriteStream: ((
			path: Parameters<typeof actual.createWriteStream>[0],
			options?: Parameters<typeof actual.createWriteStream>[1],
		) => {
			if (fsMock.impl) {
				return fsMock.impl(String(path), options) as ReturnType<
					typeof actual.createWriteStream
				>;
			}
			return actual.createWriteStream(path, options);
		}) as typeof actual.createWriteStream,
	};
});

class FakeWriteStream extends EventEmitter {
	readonly writes: string[] = [];
	failOnEnd = false;

	write(chunk: string): boolean {
		this.writes.push(chunk);
		return true;
	}

	end(callback?: () => void): this {
		if (this.failOnEnd) this.emit("error", new Error("end failed"));
		this.emit("close");
		callback?.();
		return this;
	}
}

function streamThatOpens(): FakeWriteStream {
	const stream = new FakeWriteStream();
	queueMicrotask(() => stream.emit("open"));
	return stream;
}

function expectOk<T>(result: Result<T>): T {
	if (result.isError) throw result.error;
	return result.data;
}

describe("FsManager", () => {
	const managers: FsManager[] = [];
	let dir: string;

	function track(manager = new FsManager()): FsManager {
		managers.push(manager);
		return manager;
	}

	beforeEach(async () => {
		fsMock.impl = null;
		managers.length = 0;
		dir = await mkdtemp(join(tmpdir(), "orgit-fs-"));
	});

	afterEach(async () => {
		fsMock.impl = null;
		await Promise.all(managers.map((manager) => manager.closeAll()));
		await rm(dir, { recursive: true, force: true });
	});

	test("reads text from a file", async () => {
		const path = join(dir, "note.txt");
		await writeFile(path, "héllo 👋", "utf8");

		const text = expectOk(await track().readText(path));

		expect(text).toBe("héllo 👋");
	});

	test("returns an error when a text file is missing", async () => {
		const result = await track().readText(join(dir, "missing.txt"));

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toMatchObject({ code: "ENOENT" });
	});

	test("reads JSON", async () => {
		const path = join(dir, "settings.json");
		await writeFile(path, '{"name":"orgit","count":2}\n', "utf8");

		const value = expectOk(await track().readJson(path));

		expect(value).toEqual({ name: "orgit", count: 2 });
	});

	test("returns an error when JSON is invalid", async () => {
		const path = join(dir, "bad.json");
		await writeFile(path, "{", "utf8");

		const result = await track().readJson(path);

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toBeInstanceOf(SyntaxError);
	});

	test("returns the read error when a JSON file is missing", async () => {
		const result = await track().readJson(join(dir, "missing.json"));

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toMatchObject({ code: "ENOENT" });
	});

	test("replaces text atomically and creates parent directories", async () => {
		const path = join(dir, "a", "b", "note.txt");
		const manager = track();

		expectOk(await manager.writeText(path, "one"));
		expectOk(await manager.writeText(path, "two"));

		expect(await readFile(path, "utf8")).toBe("two");
		expect(await readdir(join(dir, "a", "b"))).toEqual(["note.txt"]);
	});

	test("removes the temp file when the destination cannot be replaced", async () => {
		const target = join(dir, "blocked");
		await mkdir(target);

		const result = await track().writeText(target, "nope");

		expect(result.isError).toBe(true);
		const entries = await readdir(dir);
		expect(entries.some((name) => name.endsWith(".tmp"))).toBe(false);
		expect(entries).toContain("blocked");
	});

	test("returns an error when a parent path is a file", async () => {
		const parent = join(dir, "parent");
		await writeFile(parent, "x", "utf8");

		const result = await track().writeText(join(parent, "child.txt"), "hi");

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toMatchObject({ code: "EEXIST" });
		expect(await readFile(parent, "utf8")).toBe("x");
	});

	test("preserves the destination when the temp file cannot be written", async () => {
		const target = join(dir, "note.txt");
		await writeFile(target, "original", "utf8");
		await chmod(dir, 0o555);

		try {
			const result = await track().writeText(target, "next");

			expect(result.isError).toBe(true);
			if (!result.isError) return;
			expect(result.error).toMatchObject({ code: "EACCES" });
			expect(await readFile(target, "utf8")).toBe("original");
		} finally {
			await chmod(dir, 0o755);
		}
	});

	test("writes formatted JSON with a trailing newline", async () => {
		const path = join(dir, "cfg", "settings.json");
		const value = { name: "orgit", nested: { ok: true } };
		const manager = track();

		expectOk(await manager.writeJson(path, value));

		expect(await readFile(path, "utf8")).toBe(
			`${JSON.stringify(value, null, 2)}\n`,
		);
		expect(expectOk(await manager.readJson(path))).toEqual(value);
		expect(await readdir(join(dir, "cfg"))).toEqual(["settings.json"]);
	});

	test("appends log lines and flushes them when the log closes", async () => {
		const path = join(dir, "nested", "app.log");
		const manager = track();

		expectOk(await manager.openLog(path));
		expectOk(await manager.openLog(path));
		expectOk(manager.log(path, "hello"));
		expectOk(manager.log(path, "world\n"));
		expectOk(manager.log(path, ""));
		expectOk(await manager.closeLog(path));

		expect(await readFile(path, "utf8")).toBe("hello\nworld\n\n");
	});

	test("returns an error when logging to a file that is not open", () => {
		const path = join(dir, "missing.log");

		const result = track().log(path, "x");

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error.message).toBe(`Log not open: ${path}`);
	});

	test("closing a log that is not open succeeds", async () => {
		const result = await track().closeLog(join(dir, "missing.log"));

		expect(result).toMatchObject({ isSuccess: true, isError: false });
	});

	test("closeAll flushes every open log", async () => {
		const alpha = join(dir, "a.log");
		const beta = join(dir, "b.log");
		const manager = track();

		expectOk(await manager.openLog(alpha));
		expectOk(await manager.openLog(beta));
		expectOk(manager.log(alpha, "alpha"));
		expectOk(manager.log(beta, "beta"));
		expectOk(await manager.closeAll());

		expect(await readFile(alpha, "utf8")).toBe("alpha\n");
		expect(await readFile(beta, "utf8")).toBe("beta\n");
	});

	test("closeAll succeeds when nothing is open", async () => {
		expectOk(await track().closeAll());
	});

	test("returns an error when the log path is a directory", async () => {
		const path = join(dir, "dir.log");
		await mkdir(path);

		const result = await track().openLog(path);

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toMatchObject({ code: "EISDIR" });
	});

	test("returns an error when the log directory cannot be created", async () => {
		const parent = join(dir, "parent");
		await writeFile(parent, "x", "utf8");

		const result = await track().openLog(join(parent, "app.log"));

		expect(result.isError).toBe(true);
		if (!result.isError) return;
		expect(result.error).toMatchObject({ code: "EEXIST" });
	});

	test("opens a log once in append mode", async () => {
		const calls: Array<{ path: string; options: unknown }> = [];
		fsMock.impl = (path, options) => {
			calls.push({ path, options });
			return streamThatOpens();
		};
		const path = join(dir, "nested", "app.log");
		const manager = track();

		expectOk(await manager.openLog(path));
		expectOk(await manager.openLog(path));

		expect(calls).toEqual([
			{ path, options: { encoding: "utf8", flags: "a" } },
		]);
	});

	test("reports write errors from an open log", async () => {
		const seen: Array<{ path: string; message: string }> = [];
		let stream: FakeWriteStream | undefined;
		fsMock.impl = () => {
			stream = streamThatOpens();
			return stream;
		};
		const manager = track(
			new FsManager((path, error) => {
				seen.push({ path, message: error.message });
			}),
		);
		const path = join(dir, "app.log");

		expectOk(await manager.openLog(path));
		if (!stream) throw new Error("stream was not created");
		stream.emit("error", new Error("write failed"));

		expect(seen).toEqual([{ path, message: "write failed" }]);
	});

	test("ignores log stream errors by default", async () => {
		let stream: FakeWriteStream | undefined;
		fsMock.impl = () => {
			stream = streamThatOpens();
			return stream;
		};
		const manager = track();

		expectOk(await manager.openLog(join(dir, "app.log")));
		if (!stream) throw new Error("stream was not created");
		const opened = stream;

		expect(() => opened.emit("error", new Error("write failed"))).not.toThrow();
	});

	test("stops accepting lines after the stream closes", async () => {
		let stream: FakeWriteStream | undefined;
		fsMock.impl = () => {
			stream = streamThatOpens();
			return stream;
		};
		const path = join(dir, "app.log");
		const manager = track();

		expectOk(await manager.openLog(path));
		if (!stream) throw new Error("stream was not created");
		expectOk(manager.log(path, "hello"));
		expectOk(manager.log(path, "world\n"));
		expect(stream.writes).toEqual(["hello\n", "world\n"]);
		expectOk(await manager.closeLog(path));
		expectOk(await manager.closeAll());

		const logged = manager.log(path, "later");
		expect(logged.isError).toBe(true);
		if (!logged.isError) return;
		expect(logged.error.message).toBe(`Log not open: ${path}`);
	});

	test("returns an error when the log stream fails to close", async () => {
		const seen: string[] = [];
		let stream: FakeWriteStream | undefined;
		fsMock.impl = () => {
			stream = streamThatOpens();
			return stream;
		};
		const manager = track(
			new FsManager((_, error) => {
				seen.push(error.message);
			}),
		);
		const path = join(dir, "app.log");

		expectOk(await manager.openLog(path));
		if (!stream) throw new Error("stream was not created");
		stream.failOnEnd = true;

		const closed = await manager.closeLog(path);

		expect(closed.isError).toBe(true);
		if (!closed.isError) return;
		expect(closed.error.message).toBe("end failed");
		expect(seen).toContain("end failed");
	});
});
