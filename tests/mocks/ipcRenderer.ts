import { type Mock, vi } from "vitest";

type IpcHandler = () => void;

export type IpcMocks = {
	windowClose: Mock<IpcHandler>;
	windowMinimize: Mock<IpcHandler>;
	windowMaximize: Mock<IpcHandler>;
};

export const ipcMocks: IpcMocks = {
	windowClose: vi.fn<IpcHandler>(),
	windowMinimize: vi.fn<IpcHandler>(),
	windowMaximize: vi.fn<IpcHandler>(),
};

export const ipc: IpcMocks = ipcMocks;

export function resetIpcMocks() {
	ipcMocks.windowClose.mockClear();
	ipcMocks.windowMinimize.mockClear();
	ipcMocks.windowMaximize.mockClear();
}
