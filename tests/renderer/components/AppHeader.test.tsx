import { AppHeader } from "@renderer/components/AppHeader";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

test("renders a navigation landmark", async () => {
	const screen = await render(<AppHeader />);

	await expect.element(screen.getByRole("navigation")).toBeInTheDocument();
});

test("applies header layout and window drag classes", async () => {
	const screen = await render(<AppHeader />);
	const header = screen.getByRole("navigation");

	await expect.element(header).toHaveClass(/window-drag/);
	await expect.element(header).toHaveClass(/h-7/);
	await expect.element(header).toHaveClass(/absolute/);
});
