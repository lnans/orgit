import { useResizeWidth } from "@renderer/hooks/useResizeWidth";
import { expect, test } from "vitest";
import { type RenderResult, render } from "vitest-browser-react";

const MIN_WIDTH = 100;
const MAX_WIDTH = 400;
const INITIAL_WIDTH = 300;

function ResizablePanel() {
	const { ref, handlePointerDown } = useResizeWidth<HTMLDivElement>(
		MIN_WIDTH,
		MAX_WIDTH,
	);

	return (
		<div
			ref={ref}
			data-testid="panel"
			style={{ width: INITIAL_WIDTH, height: 100 }}
		>
			<button
				type="button"
				aria-label="Resize"
				onPointerDown={handlePointerDown}
			/>
		</div>
	);
}

function panelElement(screen: RenderResult) {
	return screen.getByTestId("panel").element() as HTMLDivElement;
}

test("pointer down sets resize cursor on the body", async () => {
	const screen = await render(<ResizablePanel />);
	const handle = screen.getByRole("button", { name: "Resize" }).element();

	handle.dispatchEvent(
		new PointerEvent("pointerdown", { clientX: 100, bubbles: true }),
	);

	expect(document.body.style.cursor).toBe("col-resize");
	expect(document.body.style.userSelect).toBe("none");

	document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
});

test("pointer move updates width within min and max", async () => {
	const screen = await render(<ResizablePanel />);
	const handle = screen.getByRole("button", { name: "Resize" }).element();
	const panel = panelElement(screen);

	handle.dispatchEvent(
		new PointerEvent("pointerdown", { clientX: 100, bubbles: true }),
	);
	document.dispatchEvent(
		new PointerEvent("pointermove", { clientX: 160, bubbles: true }),
	);
	document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

	expect(panel.style.width).toBe(`${INITIAL_WIDTH + 60}px`);
});

test("pointer move clamps width to max", async () => {
	const screen = await render(<ResizablePanel />);
	const handle = screen.getByRole("button", { name: "Resize" }).element();
	const panel = panelElement(screen);

	handle.dispatchEvent(
		new PointerEvent("pointerdown", { clientX: 0, bubbles: true }),
	);
	document.dispatchEvent(
		new PointerEvent("pointermove", { clientX: 500, bubbles: true }),
	);
	document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

	expect(panel.style.width).toBe(`${MAX_WIDTH}px`);
});

test("pointer up clears body styles and stops resizing", async () => {
	const screen = await render(<ResizablePanel />);
	const handle = screen.getByRole("button", { name: "Resize" }).element();
	const panel = panelElement(screen);

	handle.dispatchEvent(
		new PointerEvent("pointerdown", { clientX: 100, bubbles: true }),
	);
	document.dispatchEvent(
		new PointerEvent("pointermove", { clientX: 120, bubbles: true }),
	);
	document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

	expect(document.body.style.cursor).toBe("");
	expect(document.body.style.userSelect).toBe("");

	document.dispatchEvent(
		new PointerEvent("pointermove", { clientX: 200, bubbles: true }),
	);
	expect(panel.style.width).toBe(`${INITIAL_WIDTH + 20}px`);
});
