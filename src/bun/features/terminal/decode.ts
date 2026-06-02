/** Per-session UTF-8 decoder so partial multibyte sequences survive PTY chunk boundaries. */
export function createTerminalStreamDecoder() {
	const textDecoder = new TextDecoder("utf-8");

	return {
		decode(data: string | Uint8Array): string {
			return typeof data === "string"
				? data
				: textDecoder.decode(data, { stream: true });
		},
		flush() {
			textDecoder.decode();
		},
	};
}
