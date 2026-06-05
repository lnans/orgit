import { afterEach, beforeEach, mock, spyOn } from "bun:test";
import { NODE_FS_MOCK } from "./test-mocks";

mock.module("node:fs", () => ({
	createWriteStream: NODE_FS_MOCK.createWriteStream,
	appendFileSync: NODE_FS_MOCK.appendFileSync,
	writeFileSync: NODE_FS_MOCK.writeFileSync,
	readFileSync: NODE_FS_MOCK.readFileSync,
	mkdirSync: NODE_FS_MOCK.mkdirSync,
	existsSync: NODE_FS_MOCK.existsSync,
	readdirSync: NODE_FS_MOCK.readdirSync,
}));

beforeEach(async () => {
	spyOn(console, "debug").mockImplementation(() => {});
	spyOn(console, "info").mockImplementation(() => {});
	spyOn(console, "warn").mockImplementation(() => {});
	spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	mock.restore();
});
