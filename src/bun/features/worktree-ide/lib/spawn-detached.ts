/** Start a child process without blocking the main process or inheriting stdio. */
export function spawnDetached(
	command: string[],
	options: { cwd?: string } = {},
): void {
	Bun.spawn(command, {
		...options,
		stdout: "ignore",
		stderr: "ignore",
		stdin: "ignore",
	});
}
