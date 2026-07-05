import { beforeEach, describe, expect, mock, test } from "bun:test";
import { AppStateManager } from "@/server/features/app-state-manager";
import { FsManager } from "@/server/features/fs-manager";
import type { ILogger } from "@/server/types/server.types";
import { NODE_FS_MOCK } from "@/tests";

describe("AppStateManager", () => {
	const stateFilePath = "/appStateFolder/state.json";
	const defaults = { workspacePath: "/workspace" };
	const defaultsJson = `${JSON.stringify(defaults, undefined, 2)}\n`;

	const loggerMock: ILogger = {
		debug: mock(() => null),
		info: mock(() => null),
		warn: mock(() => null),
		error: mock(() => null),
	};

	let fsManager: FsManager;

	const createManager = () =>
		new AppStateManager(loggerMock, fsManager, "/appStateFolder", defaults);

	const clearMocks = () => {
		for (const mockFn of Object.values(NODE_FS_MOCK)) {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		}
		for (const mockFn of Object.values(loggerMock)) {
			mockFn.mockClear();
		}
	};

	beforeEach(() => {
		fsManager = new FsManager();
		clearMocks();
	});

	test("ensureReady: writes defaults and creates workspace when state file is missing", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(false);

		const manager = createManager();
		manager.ensureReady();

		expect(NODE_FS_MOCK.mkdirSync).toHaveBeenCalledWith("/appStateFolder", {
			recursive: true,
		});
		expect(NODE_FS_MOCK.mkdirSync).toHaveBeenCalledWith("/workspace", {
			recursive: true,
		});
		expect(NODE_FS_MOCK.writeFileSync).toHaveBeenCalledWith(stateFilePath, defaultsJson, {
			encoding: "utf8",
		});
		expect(manager.state).toEqual(defaults);
	});

	test("ensureReady: loads valid state and skips write when nothing changed", () => {
		const persisted = {
			workspacePath: "/workspace",
		};
		const persistedJson = `${JSON.stringify(persisted, undefined, 2)}\n`;

		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce(persistedJson);

		const manager = createManager();
		manager.ensureReady();

		expect(manager.state).toEqual(persisted);
		expect(NODE_FS_MOCK.writeFileSync).not.toHaveBeenCalled();
	});

	test("ensureReady: creates workspace folder from persisted state", () => {
		const persisted = { workspacePath: "/custom-workspace" };
		const persistedJson = `${JSON.stringify(persisted, undefined, 2)}\n`;

		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce(persistedJson);

		const manager = createManager();
		manager.ensureReady();

		expect(manager.state).toEqual(persisted);
		expect(NODE_FS_MOCK.mkdirSync).toHaveBeenCalledWith("/custom-workspace", {
			recursive: true,
		});
		expect(NODE_FS_MOCK.writeFileSync).not.toHaveBeenCalled();
	});

	test("ensureReady: keeps defaults on invalid JSON without repairing file", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce("{ invalid json");

		const manager = createManager();
		manager.ensureReady();

		expect(manager.state).toEqual(defaults);
		expect(NODE_FS_MOCK.mkdirSync).toHaveBeenCalledWith("/workspace", {
			recursive: true,
		});
		expect(NODE_FS_MOCK.writeFileSync).not.toHaveBeenCalled();
		expect(loggerMock.error).toHaveBeenCalled();
	});

	test("ensureReady: falls back to defaults on invalid schema and repairs file", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce(
			`${JSON.stringify({ workspacePath: "" }, undefined, 2)}\n`,
		);

		const manager = createManager();
		manager.ensureReady();

		expect(manager.state).toEqual(defaults);
		expect(NODE_FS_MOCK.writeFileSync).toHaveBeenCalledWith(stateFilePath, defaultsJson, {
			encoding: "utf8",
		});
		expect(loggerMock.error).toHaveBeenCalled();
	});

	test("ensureReady: sanitizes invalid optional fields and repairs file", () => {
		const sanitized = { workspacePath: "/workspace" };

		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockReturnValueOnce(
			`${JSON.stringify({ workspacePath: "/workspace", selectedRepositoryPath: "" }, undefined, 2)}\n`,
		);

		const manager = createManager();
		manager.ensureReady();

		expect(manager.state).toEqual(sanitized);
		expect(NODE_FS_MOCK.writeFileSync).toHaveBeenCalledWith(
			stateFilePath,
			`${JSON.stringify(sanitized, undefined, 2)}\n`,
			{ encoding: "utf8" },
		);
	});

	test("ensureReady: throws when state folder cannot be created", () => {
		const error = new Error("EACCES");
		NODE_FS_MOCK.mkdirSync.mockImplementationOnce(() => {
			throw error;
		});

		const manager = createManager();

		expect(() => manager.ensureReady()).toThrow(error);
		expect(loggerMock.error).toHaveBeenCalled();
	});

	test("ensureReady: throws when state file existence cannot be checked", () => {
		const error = new Error("EACCES");
		NODE_FS_MOCK.existsSync.mockImplementationOnce(() => {
			throw error;
		});

		const manager = createManager();

		expect(() => manager.ensureReady()).toThrow(error);
		expect(loggerMock.error).toHaveBeenCalled();
	});

	test("ensureReady: throws when persisted state cannot be read", () => {
		const error = new Error("ENOENT");
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(true);
		NODE_FS_MOCK.readFileSync.mockImplementationOnce(() => {
			throw error;
		});

		const manager = createManager();

		expect(() => manager.ensureReady()).toThrow(error);
	});

	test("ensureReady: throws when workspace folder cannot be created", () => {
		const error = new Error("EACCES");
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(false);
		NODE_FS_MOCK.mkdirSync.mockReturnValueOnce(undefined as never).mockImplementationOnce(() => {
			throw error;
		});

		const manager = createManager();

		expect(() => manager.ensureReady()).toThrow(error);
		expect(loggerMock.error).toHaveBeenCalled();
	});

	test("state: returns a defensive clone", () => {
		NODE_FS_MOCK.existsSync.mockReturnValueOnce(false);

		const manager = createManager();
		manager.ensureReady();

		const state = manager.state;
		state.workspacePath = "/mutated";

		expect(manager.state).toEqual(defaults);
	});
});
