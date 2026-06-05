export type Result<T> = T extends void
	?
			| { isSuccess: true; isError?: never; data?: never; error?: never }
			| { isSuccess?: never; isError: true; data?: never; error: unknown }
	:
			| { isSuccess: true; isError?: never; data: T; error?: never }
			| { isSuccess?: never; isError: true; data?: never; error: unknown };

export interface ILogger {
	debug: (message: string, ...args: unknown[]) => void;
	info: (message: string, ...args: unknown[]) => void;
	warn: (message: string, ...args: unknown[]) => void;
	error: (message: string, ...args: unknown[]) => void;
}

export interface IFsManager {
	existsSync: (path: string) => Result<boolean>;

	readFileSync: (path: string) => Result<string>;
	writeFileSync: (path: string, content: string) => Result<void>;
	appendFileSync: (path: string, content: string) => Result<void>;

	createWriteStream: (path: string) => Result<string>;
	writeStream: (streamId: string, chunk: string) => Promise<Result<void>>;
	closeWriteStream: (streamId: string) => Promise<Result<void>>;

	mkdirSync: (path: string) => Result<string | undefined>;

	findAtExactDepthSync: (
		path: string,
		search: string,
		type: "dir" | "file",
		depth: number,
	) => string[];

	parseJson: (content: string) => Result<unknown>;
	stringifyJson: (obj: unknown) => Result<string>;
}
