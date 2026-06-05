import { beforeEach, describe, expect, test } from "bun:test";
import { FsManager } from "@/server/features/fs-manager";
import { NODE_FS_MOCK } from "@/tests";

describe("FsManager", () => {
	let fsManager: FsManager;

	beforeEach(() => {
		fsManager = new FsManager();
	});

	test("readFileSync: returns file content on success", () => {
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce("hello");

		const result = fsManager.readFileSync("/path/file.txt");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBe("hello");
		}
	});

	test("readFileSync: returns error when fs throws", () => {
		const error = new Error("ENOENT");
		NODE_FS_MOCK.readFileSync.mockImplementationOnce(() => {
			throw error;
		});

		const result = fsManager.readFileSync("/missing.txt");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBe(error);
		}
	});

	test("existsSync: returns true when file exists", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);

		const result = fsManager.existsSync("/path/file.txt");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBe(true);
		}
		expect(NODE_FS_MOCK.existsSync).toHaveBeenCalledWith("/path/file.txt");
	});

	test("existsSync: returns false when file does not exist", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(false);

		const result = fsManager.existsSync("/missing.txt");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBe(false);
		}
	});

	test("existsSync: returns error when fs throws", () => {
		const error = new Error("EACCES");
		NODE_FS_MOCK.existsSync.mockImplementationOnce(() => {
			throw error;
		});

		const result = fsManager.existsSync("/restricted.txt");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBe(error);
		}
	});

	test("writeFileSync: writes content on success", () => {
		const result = fsManager.writeFileSync("/path/file.txt", "content");

		expect(result.isSuccess).toBe(true);
		expect(NODE_FS_MOCK.writeFileSync).toHaveBeenCalledWith("/path/file.txt", "content", {
			encoding: "utf8",
		});
	});

	test("writeFileSync: returns error when fs throws", () => {
		const error = new Error("EACCES");
		NODE_FS_MOCK.writeFileSync.mockImplementationOnce(() => {
			throw error;
		});

		const result = fsManager.writeFileSync("/restricted.txt", "content");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBe(error);
		}
	});

	test("mkdirSync: preserves undefined return value", () => {
		NODE_FS_MOCK.mkdirSync.mockReturnValueOnce(undefined as never);

		const result = fsManager.mkdirSync("/path");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBeUndefined();
		}
	});

	test("parseJson: parses valid object", () => {
		const result = fsManager.parseJson('{"key":"value"}');

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toEqual({ key: "value" });
		}
	});

	test("parseJson: parses valid array", () => {
		const result = fsManager.parseJson("[1, 2, 3]");

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toEqual([1, 2, 3]);
		}
	});

	test("parseJson: returns error for invalid json", () => {
		const result = fsManager.parseJson("{ invalid");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBeInstanceOf(SyntaxError);
		}
	});

	test("stringifyJson: parse valid JSON", () => {
		const result = fsManager.stringifyJson({ test: "val1" });

		expect(result.isSuccess).toBe(true);
		if (result.isSuccess) {
			expect(result.data).toBe('{\n  "test": "val1"\n}\n');
		}
	});

	test("stringifyJson: returns error on invalid string", () => {
		const result = fsManager.stringifyJson({ test: BigInt(9007199254740991) });

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBeInstanceOf(TypeError);
		}
	});

	test("writeStream: resolves when write callback succeeds", async () => {
		const createResult = fsManager.createWriteStream("/path/log.txt");
		expect(createResult.isSuccess).toBe(true);
		if (!createResult.isSuccess) return;

		const writeResult = await fsManager.writeStream(createResult.data, "chunk\n");

		expect(writeResult.isSuccess).toBe(true);
		expect(NODE_FS_MOCK.streamWrite).toHaveBeenCalledWith("chunk\n", "utf8", expect.any(Function));
	});

	test("writeStream: returns error for unknown stream id", async () => {
		const result = await fsManager.writeStream("missing-id", "chunk\n");

		expect(result.isError).toBe(true);
		if (result.isError) {
			expect(result.error).toBeInstanceOf(Error);
		}
	});

	test("closeWriteStream: closes and removes stream", async () => {
		const createResult = fsManager.createWriteStream("/path/log.txt");
		expect(createResult.isSuccess).toBe(true);
		if (!createResult.isSuccess) return;

		const closeResult = await fsManager.closeWriteStream(createResult.data);

		expect(closeResult.isSuccess).toBe(true);
		expect(NODE_FS_MOCK.streamEnd).toHaveBeenCalled();

		const writeAfterClose = await fsManager.writeStream(createResult.data, "chunk\n");
		expect(writeAfterClose.isError).toBe(true);
	});

	test("createWriteStream: registers error handler on stream", () => {
		fsManager.createWriteStream("/path/log.txt");

		expect(NODE_FS_MOCK.streamOn).toHaveBeenCalledWith("error", expect.any(Function));
	});
});
