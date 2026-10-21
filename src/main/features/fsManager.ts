import { randomUUID } from "node:crypto";
import { createWriteStream, type WriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { err, ok, type Result, toResultAsync } from "./result";

const ENCODING = "utf8" satisfies BufferEncoding;

export class FsManager {
	private readonly logs = new Map<string, WriteStream>();

	constructor(
		private readonly onLogError: (
			path: string,
			error: Error,
		) => void = () => {},
	) {}

	public readText(path: string): Promise<Result<string>> {
		return toResultAsync(() => readFile(path, ENCODING));
	}

	public async readJson(path: string): Promise<Result<unknown>> {
		const text = await this.readText(path);
		if (text.isError) return text;
		try {
			return ok(JSON.parse(text.data));
		} catch (error) {
			return err(error);
		}
	}

	public writeText(path: string, content: string): Promise<Result> {
		return toResultAsync(async () => {
			await mkdir(dirname(path), { recursive: true });
			const tmp = `${path}.${randomUUID()}.tmp`;
			try {
				await writeFile(tmp, content, { encoding: ENCODING, flush: true });
				await rename(tmp, path);
			} catch (error) {
				await rm(tmp, { force: true });
				throw error;
			}
		});
	}

	public writeJson(path: string, value: unknown): Promise<Result> {
		return this.writeText(path, `${JSON.stringify(value, null, 2)}\n`);
	}

	public async openLog(path: string): Promise<Result> {
		if (this.logs.has(path)) return ok();

		const dir = await toResultAsync(() =>
			mkdir(dirname(path), { recursive: true }),
		);
		if (dir.isError) return dir;

		return new Promise((resolve) => {
			const stream = createWriteStream(path, {
				encoding: ENCODING,
				flags: "a",
			});
			stream.once("error", (error) => resolve(err(error))); // open failure
			stream.once("open", () => {
				stream.on("error", (error) => this.onLogError(path, error));
				stream.once("close", () => this.logs.delete(path));
				this.logs.set(path, stream);
				resolve(ok());
			});
		});
	}

	public log(path: string, line: string): Result {
		const stream = this.logs.get(path);
		if (!stream) return err(new Error(`Log not open: ${path}`));
		stream.write(line.endsWith("\n") ? line : `${line}\n`);
		return ok();
	}

	public closeLog(path: string): Promise<Result> {
		const stream = this.logs.get(path);
		if (!stream) return Promise.resolve(ok());
		return new Promise((resolve) => {
			stream.once("error", (error) => resolve(err(error)));
			stream.end(() => resolve(ok()));
		});
	}

	public async closeAll(): Promise<Result> {
		const results = await Promise.all(
			[...this.logs.keys()].map((path) => this.closeLog(path)),
		);
		return results.find((r) => r.isError) ?? ok();
	}
}
