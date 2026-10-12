import { TitleBarButtons } from "@renderer/components/TitleBarButtons";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { type RenderResult, render } from "vitest-browser-react";
import { ipcMocks } from "../../mocks/ipcRenderer";

async function clickWindowControl(screen: RenderResult, colorClass: string) {
	const control = screen
		.getByRole("button")
		.elements()
		.find((element: HTMLElement | SVGElement) =>
			element.className.includes(colorClass),
		);

	if (!control) {
		throw new Error(`Window control "${colorClass}" not found`);
	}

	await userEvent.click(control);
}

async function clickQuitAction(screen: RenderResult) {
	const quit = screen
		.getByRole("button")
		.elements()
		.find(
			(element: HTMLElement | SVGElement) =>
				element.getAttribute("data-slot") === "alert-dialog-action",
		);

	if (!(quit instanceof HTMLButtonElement)) {
		throw new Error("Quit action not found");
	}

	quit.click();
}

test("renders three window control buttons", async () => {
	const screen = await render(<TitleBarButtons />);

	expect(screen.getByRole("button").length).toBe(3);
});

test("minimize and maximize call ipc handlers", async () => {
	const screen = await render(<TitleBarButtons />);

	await clickWindowControl(screen, "bg-traffic-orange");
	expect(ipcMocks.windowMinimize).toHaveBeenCalledOnce();

	await clickWindowControl(screen, "bg-traffic-green");
	expect(ipcMocks.windowMaximize).toHaveBeenCalledOnce();
});

test("close control opens the quit confirmation alert", async () => {
	const screen = await render(<TitleBarButtons />);

	await clickWindowControl(screen, "bg-traffic-red");

	await expect.element(screen.getByRole("alertdialog")).toBeVisible();
	await expect
		.element(screen.getByRole("heading", { name: "Quit" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByText("Are you sure you want to quit the application?"))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Cancel" }))
		.toBeInTheDocument();
});

test("quit confirmation exposes cancel and destructive quit actions", async () => {
	const screen = await render(<TitleBarButtons />);

	await clickWindowControl(screen, "bg-traffic-red");

	await expect
		.element(screen.getByRole("button", { name: "Cancel" }))
		.toHaveAttribute("data-slot", "alert-dialog-cancel");
	await expect
		.element(screen.getByRole("button", { name: "Quit" }))
		.toHaveAttribute("data-slot", "alert-dialog-action");
});

test("quit confirmation calls onQuit to close the window", async () => {
	const screen = await render(<TitleBarButtons />);

	await clickWindowControl(screen, "bg-traffic-red");
	await clickQuitAction(screen);

	expect(ipcMocks.windowClose).toHaveBeenCalledOnce();
});
