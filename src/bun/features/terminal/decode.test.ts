import { describe, expect, test } from "bun:test";
import { createTerminalStreamDecoder } from "./decode";

describe("createTerminalStreamDecoder", () => {
	test("preserves box-drawing characters split across PTY chunks", () => {
		const decoder = createTerminalStreamDecoder();
		const bytes = new TextEncoder().encode("┌─┐\n");

		let output = "";
		for (const byte of bytes) {
			output += decoder.decode(new Uint8Array([byte]));
		}

		expect(output).toBe("┌─┐\n");
	});

	test("passes through string data unchanged", () => {
		const decoder = createTerminalStreamDecoder();
		expect(decoder.decode("plain text")).toBe("plain text");
	});
});
