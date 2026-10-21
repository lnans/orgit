type Success<T> = { isSuccess: true; isError: false; data: T };
type Failure = { isSuccess: false; isError: true; error: Error };

export type Result<T = void> = Success<T> | Failure;

export function ok(): Success<void>;
export function ok<T>(data: T): Success<T>;
export function ok(data?: unknown) {
	return { isSuccess: true, isError: false, data } as Success<unknown>;
}

export const err = (error: unknown): Failure => ({
	isSuccess: false,
	isError: true,
	error:
		error instanceof Error ? error : new Error(String(error), { cause: error }),
});

export function toResult<T>(fn: () => T): Result<T> {
	try {
		return ok(fn());
	} catch (error) {
		return err(error);
	}
}

export async function toResultAsync<T>(
	fn: () => Promise<T>,
): Promise<Result<T>> {
	try {
		return ok(await fn());
	} catch (error) {
		return err(error);
	}
}
