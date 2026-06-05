import { mock } from "bun:test";

const streamWrite = mock(
	(
		_chunk: string,
		_encodingOrCallback?: BufferEncoding | (() => void),
		callback?: (error?: Error | null) => void,
	) => {
		if (typeof _encodingOrCallback === "function") {
			_encodingOrCallback();
			return true;
		}

		callback?.();
		return true;
	},
);
const streamOn = mock(() => null);
const streamOnce = mock(() => null);
const streamEnd = mock((callback?: () => void) => {
	callback?.();
});

export const NODE_FS_MOCK = {
	appendFileSync: mock(() => null),
	writeFileSync: mock(() => null),
	readFileSync: mock(() => ""),
	mkdirSync: mock(() => null),
	existsSync: mock(() => false),
	readdirSync: mock(() => false),

	createWriteStream: mock(() => ({
		write: streamWrite,
		on: streamOn,
		once: streamOnce,
		end: streamEnd,
	})),
	streamWrite,
	streamOn,
	streamOnce,
	streamEnd,
} as const;
