import { describe, expect, test } from "bun:test";
import { shallowEqualRecord } from "./equality";

describe("shallowEqualRecord", () => {
	test("returns true for equal records", () => {
		expect(shallowEqualRecord({ a: "1", b: "2" }, { a: "1", b: "2" })).toBe(
			true,
		);
	});

	test("returns false when keys or values differ", () => {
		expect(shallowEqualRecord({ a: "1" }, { a: "2" })).toBe(false);
		expect(shallowEqualRecord({ a: "1" }, { b: "1" })).toBe(false);
		expect(shallowEqualRecord({ a: "1", b: "2" }, { a: "1" })).toBe(false);
	});
});
