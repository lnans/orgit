import { useToggle } from "@renderer/hooks/useToggle";
import { expect, test } from "vitest";
import { renderHook } from "vitest-browser-react";

test("defaults to false", async () => {
	const { result } = await renderHook(() => useToggle());

	expect(result.current[0]).toBe(false);
});

test("defaults to true when the argument is true", async () => {
	const { result } = await renderHook(() => useToggle(true));

	expect(result.current[0]).toBe(true);
});

test("toggle inverts the value", async () => {
	const { result, act } = await renderHook(() => useToggle());

	await act(() => {
		result.current[1]();
	});
	expect(result.current[0]).toBe(true);

	await act(() => {
		result.current[1]();
	});
	expect(result.current[0]).toBe(false);
});

test("setValue updates the value", async () => {
	const { result, act } = await renderHook(() => useToggle());

	await act(() => {
		result.current[2](true);
	});
	expect(result.current[0]).toBe(true);

	await act(() => {
		result.current[2](false);
	});
	expect(result.current[0]).toBe(false);
});
