import { afterEach, beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import { FsManager } from "@/server/features/fs-manager";
import { Logger } from "@/server/features/logger";
import { NODE_FS_MOCK } from "@/tests";

async function flushPendingWrites(): Promise<void> {
	await Promise.resolve();
}

describe("Logger", async () => {
	setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

	const fsManager = new FsManager();
	const logger = new Logger("/fakepath/logs", fsManager);

	beforeEach(() => logger.ensureReady());
	afterEach(async () => {
		await logger.ensureStopped();
	});

	test("ensureReady: Init log file and open stream", async () => {
		expect(NODE_FS_MOCK.mkdirSync).toHaveBeenCalledWith("/fakepath/logs", {
			recursive: true,
		});
		expect(NODE_FS_MOCK.appendFileSync).toHaveBeenCalledWith(
			"/fakepath/logs/2020-01-01T00-00-00.000Z.log",
			"",
			{ encoding: "utf8" },
		);
		expect(NODE_FS_MOCK.createWriteStream).toHaveBeenCalledWith(
			"/fakepath/logs/2020-01-01T00-00-00.000Z.log",
			{
				flags: "a",
				encoding: "utf8",
			},
		);
	});

	test("ensureStopped: close stream", async () => {
		await logger.ensureStopped();

		expect(NODE_FS_MOCK.streamEnd).toHaveBeenCalled();
	});

	test("debug: Write in file", async () => {
		logger.debug("Test message", { arg1: "val1" });
		await flushPendingWrites();

		expect(NODE_FS_MOCK.streamWrite).toHaveBeenCalledWith(
			'[2020-01-01T00:00:00.000Z] DEBUG Test message { arg1: "val1" }\n',
			"utf8",
			expect.any(Function),
		);
	});

	test("info: Write in file", async () => {
		logger.info("Test message", { arg1: "val1" });
		await flushPendingWrites();

		expect(NODE_FS_MOCK.streamWrite).toHaveBeenCalledWith(
			'[2020-01-01T00:00:00.000Z] INFO Test message { arg1: "val1" }\n',
			"utf8",
			expect.any(Function),
		);
	});

	test("warn: Write in file", async () => {
		logger.warn("Test message", { arg1: "val1" });
		await flushPendingWrites();

		expect(NODE_FS_MOCK.streamWrite).toHaveBeenCalledWith(
			'[2020-01-01T00:00:00.000Z] WARN Test message { arg1: "val1" }\n',
			"utf8",
			expect.any(Function),
		);
	});

	test("error: Write in file", async () => {
		logger.error("Test message", { arg1: "val1" });
		await flushPendingWrites();

		expect(NODE_FS_MOCK.streamWrite).toHaveBeenCalledWith(
			'[2020-01-01T00:00:00.000Z] ERROR Test message { arg1: "val1" }\n',
			"utf8",
			expect.any(Function),
		);
	});
});
