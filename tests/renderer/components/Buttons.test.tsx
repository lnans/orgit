import { Button } from "@renderer/components/Button";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

test("renders label and uses the default slot", async () => {
	const screen = await render(<Button>Save</Button>);
	const button = screen.getByRole("button", { name: "Save" });

	await expect.element(button).toHaveAttribute("data-slot", "button");
});

test("applies variant and size classes", async () => {
	const screen = await render(
		<Button variant="destructive" size="lg">
			Delete
		</Button>,
	);

	const button = screen.getByRole("button", { name: "Delete" });
	await expect.element(button).toHaveClass(/bg-destructive\/10/);
	await expect.element(button).toHaveClass(/h-9/);
});

test("merges a custom className", async () => {
	const screen = await render(<Button className="custom-class">Action</Button>);
	const button = screen.getByRole("button", { name: "Action" });

	await expect.element(button).toHaveClass(/custom-class/);
});

test("forwards disabled state", async () => {
	const screen = await render(
		<Button disabled onClick={() => {}}>
			Click
		</Button>,
	);

	await expect
		.element(screen.getByRole("button", { name: "Click" }))
		.toBeDisabled();
});

test("calls onClick when clicked", async () => {
	const onClick = vi.fn();
	const screen = await render(<Button onClick={onClick}>Click</Button>);

	await screen.getByRole("button", { name: "Click" }).click();
	expect(onClick).toHaveBeenCalledOnce();
});
