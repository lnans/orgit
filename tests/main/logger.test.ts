import { join } from "node:path";
import type { FsManager } from "@main/features/fsManager";
import { Logger } from "@main/features/logger";
import { err, ok, type Result } from "@main/features/result";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	type Mock,
	test,
	vi,
} from "vitest";

const NOW = "2026-10-21T15:04:05.006Z";
const FILE_STAMP = "2026-10-21T15-04-05.006Z";

interface FsMock {
	openLog: Mock<(path: string) => Promise<Result>>;
	closeLog: Mock<(path: string) => Promise<Result>>;
	log: Mock<(path: string, line: string) => Result>;
}

function createFs(overrides: Partial<FsMock> = {}): FsMock & FsManager {
	return {
		openLog: vi.fn<(path: string) => Promise<Result>>(async () => ok()),
		closeLog: vi.fn<(path: string) => Promise<Result>>(async () => ok()),
		log: vi.fn<(path: string, line: string) => Result>(() => ok()),
		...overrides,
	} as FsMock & FsManager;
}

function prefix(level: string, message: string): string {
	return `[${NOW}] ${level} ${message}`;
}

describe("Logger", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(NOW));
		vi.spyOn(console, "debug").mockImplementation(() => {});
		vi.spyOn(console, "info").mockImplementation(() => {});
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test("builds a timestamped file path inside the logs folder", () => {
		const logger = new Logger(join("var", "logs"), createFs());

		expect(logger.filePath).toBe(join("var", "logs", `${FILE_STAMP}.log`));
	});

	test("opens the log file and announces that it is ready", async () => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);

		await expect(logger.ensureReady()).resolves.toBe(logger);

		expect(fs.openLog).toHaveBeenCalledWith(logger.filePath);
		expect(fs.log).toHaveBeenCalledWith(
			logger.filePath,
			prefix("INFO", `[Logger] Ready in ${logger.filePath}`),
		);
	});

	test("throws when the log file cannot be opened", async () => {
		const failure = new Error("disk full");
		const fs = createFs({
			openLog: vi.fn<(path: string) => Promise<Result>>(async () =>
				err(failure),
			),
		});
		const logger = new Logger("/logs", fs);

		await expect(logger.ensureReady()).rejects.toBe(failure);
		await logger.ensureStopped();

		expect(fs.log).not.toHaveBeenCalled();
		expect(fs.closeLog).not.toHaveBeenCalled();
	});

	test("does nothing when stopped before it is ready", async () => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);

		await logger.ensureStopped();

		expect(fs.closeLog).not.toHaveBeenCalled();
	});

	test("closes the log file and stops writing to it", async () => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);
		await logger.ensureReady();

		await logger.ensureStopped();
		await logger.ensureStopped();
		logger.info("later");

		expect(fs.closeLog).toHaveBeenCalledTimes(1);
		expect(fs.closeLog).toHaveBeenCalledWith(logger.filePath);
		expect(fs.log).toHaveBeenCalledTimes(1);
	});

	test("stops file logging even if closing the log fails", async () => {
		const fs = createFs({
			closeLog: vi.fn<(path: string) => Promise<Result>>(async () =>
				err(new Error("close failed")),
			),
		});
		const logger = new Logger("/logs", fs);
		await logger.ensureReady();

		await logger.ensureStopped();
		logger.info("later");

		expect(fs.log).toHaveBeenCalledTimes(1);
	});

	test("keeps console output and history when the log file is not ready", () => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);

		logger.info("boot");

		expect(fs.log).not.toHaveBeenCalled();
		expect(console.info).toHaveBeenCalledWith(prefix("INFO", "boot"));
		expect(logger.getHistory()).toEqual([
			{ ts: NOW, level: "info", message: "boot", details: "" },
		]);
	});

	test.each([
		["debug", "DEBUG"],
		["info", "INFO"],
		["warn", "WARN"],
		["error", "ERROR"],
	] as const)("records %s logs", async (level, label) => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);
		await logger.ensureReady();
		fs.log.mockClear();

		logger[level]("hello", "extra");

		const line = prefix(label, "hello");
		expect(console[level]).toHaveBeenCalledWith(line, "extra");
		expect(fs.log).toHaveBeenCalledWith(logger.filePath, `${line} extra`);
		expect(logger.getHistory().at(-1)).toMatchObject({
			ts: NOW,
			level,
			message: "hello",
			details: "extra",
		});
	});

	test("formats errors, strings, and other values into details", async () => {
		const fs = createFs();
		const logger = new Logger("/logs", fs);
		await logger.ensureReady();
		fs.log.mockClear();
		const withStack = new Error("boom");
		const withoutStack = new Error("plain");
		withoutStack.stack = undefined;

		logger.error("failed", withStack, "while saving", { a: 1 }, 3);
		logger.error("again", withoutStack);

		expect(fs.log).toHaveBeenNthCalledWith(
			1,
			logger.filePath,
			`${prefix("ERROR", "failed")} ${withStack.stack} while saving { a: 1 } 3`,
		);
		expect(fs.log).toHaveBeenNthCalledWith(
			2,
			logger.filePath,
			`${prefix("ERROR", "again")} plain`,
		);
		expect(console.error).toHaveBeenCalledWith(
			prefix("ERROR", "failed"),
			withStack,
			"while saving",
			{ a: 1 },
			3,
		);
	});

	test("notifies subscribers until they unsubscribe", () => {
		const logger = new Logger("/logs", createFs());
		const listener = vi.fn();
		const unsubscribe = logger.subscribe(listener);

		logger.info("one");
		unsubscribe();
		logger.info("two");

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith({
			ts: NOW,
			level: "info",
			message: "one",
			details: "",
		});
	});

	test("keeps logging when a subscriber throws", () => {
		const logger = new Logger("/logs", createFs());
		const first = vi.fn(() => {
			throw new Error("listener failed");
		});
		const second = vi.fn();
		logger.subscribe(first);
		logger.subscribe(second);

		logger.warn("heads up");

		expect(first).toHaveBeenCalledOnce();
		expect(second).toHaveBeenCalledOnce();
		expect(logger.getHistory()).toHaveLength(1);
	});

	test("drops the oldest entries once history reaches the limit", () => {
		const logger = new Logger("/logs", createFs(), 2);

		logger.debug("a");
		logger.info("b");
		logger.warn("c");

		expect(logger.getHistory().map((entry) => entry.message)).toEqual([
			"b",
			"c",
		]);
	});

	test("returns a copy of the history", () => {
		const logger = new Logger("/logs", createFs());
		logger.error("saved");

		const history = logger.getHistory();
		history.pop();

		expect(logger.getHistory()).toHaveLength(1);
	});
});
