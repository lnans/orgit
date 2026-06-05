import {
	appendFileSync,
	createWriteStream,
	type Dirent,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	type WriteStream,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { IFsManager, Result } from "@/server/types/server.types";

const ENCODING: BufferEncoding = "utf8";

export class FsManager implements IFsManager {
	private readonly _openedStreams = new Map<string, WriteStream>();

	public existsSync(path: string): Result<boolean> {
		return this.safeRunSync(() => existsSync(path));
	}

	public readFileSync(path: string): Result<string> {
		return this.safeRunSync(() => readFileSync(path, ENCODING));
	}

	public writeFileSync(path: string, content: string): Result<void> {
		return this.safeRunVoid(() => writeFileSync(path, content, { encoding: ENCODING }));
	}

	public appendFileSync(path: string, content: string): Result<void> {
		return this.safeRunVoid(() => appendFileSync(path, content, { encoding: ENCODING }));
	}

	public createWriteStream(path: string): Result<string> {
		try {
			const stream = createWriteStream(path, {
				flags: "a",
				encoding: ENCODING,
			});
			const streamId = crypto.randomUUID();

			stream.on("error", (error) => {
				this._openedStreams.delete(streamId);
				this.logStreamError("Write stream error", error);
			});

			this._openedStreams.set(streamId, stream);
			return { isSuccess: true, data: streamId };
		} catch (error) {
			return { isError: true, error };
		}
	}

	public writeStream(streamId: string, chunk: string): Promise<Result<void>> {
		const stream = this._openedStreams.get(streamId);
		if (stream === undefined) {
			return Promise.resolve({
				isError: true,
				error: new Error(`[FsManager] StreamId not found: ${streamId}`),
			});
		}

		return new Promise((resolve) => {
			stream.write(chunk, ENCODING, (error) => {
				if (error) {
					resolve({ isError: true, error });
					return;
				}

				resolve({ isSuccess: true });
			});
		});
	}

	public closeWriteStream(streamId: string): Promise<Result<void>> {
		const stream = this._openedStreams.get(streamId);
		if (stream === undefined) {
			return Promise.resolve({
				isError: true,
				error: new Error(`[FsManager] StreamId not found: ${streamId}`),
			});
		}

		this._openedStreams.delete(streamId);

		return new Promise((resolve) => {
			stream.once("error", (error) => {
				this.logStreamError("Stream close error", error);
				resolve({ isError: true, error });
			});
			stream.end(() => {
				resolve({ isSuccess: true });
			});
		});
	}

	public mkdirSync(path: string): Result<string | undefined> {
		return this.safeRunSync(() => mkdirSync(path, { recursive: true }));
	}

	public findAtExactDepthSync(
		path: string,
		search: string,
		type: "dir" | "file",
		depth: number,
	): string[] {
		if (depth < 0) return [];

		const pathExistResult = this.existsSync(path);
		if (pathExistResult.isError || !pathExistResult.data) return [];

		const readDirResult = this.safeRunSync(() => readdirSync(path, { withFileTypes: true }));
		if (readDirResult.isError) return [];

		const isMatchingType = (entry: Dirent<string>) =>
			(type === "dir" && entry.isDirectory()) || (type === "file" && entry.isFile());

		const found: string[] = [];
		for (const entry of readDirResult.data) {
			const fullPath = join(path, entry.name);

			if (isMatchingType(entry) && entry.name === search && depth === 0) {
				found.push(fullPath);
			}

			if (entry.isDirectory() && depth > 0) {
				found.push(...this.findAtExactDepthSync(fullPath, search, type, depth - 1));
			}
		}

		return found;
	}

	public parseJson(content: string): Result<unknown> {
		return this.safeRunSync(() => JSON.parse(content));
	}

	public stringifyJson(obj: unknown): Result<string> {
		return this.safeRunSync(() => `${JSON.stringify(obj, undefined, 2)}\n`);
	}

	private safeRunSync<T>(fn: () => T): Result<T> {
		try {
			return { isSuccess: true, data: fn() } as Result<T>;
		} catch (error) {
			return { isError: true, error } as Result<T>;
		}
	}

	private safeRunVoid(fn: () => void): Result<void> {
		try {
			fn();
			return { isSuccess: true };
		} catch (error) {
			return { isError: true, error };
		}
	}

	private logStreamError(context: string, error: Error): void {
		process.stderr.write(`[FsManager] ${context}: ${error.message}\n`);
	}
}
