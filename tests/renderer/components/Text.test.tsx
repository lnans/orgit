import { Text } from "@renderer/components/Text";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

test("renders children", async () => {
	const screen = await render(<Text>Repository name</Text>);

	await expect.element(screen.getByText("Repository name")).toBeInTheDocument();
});

test("applies the default size class", async () => {
	const screen = await render(<Text>Label</Text>);

	await expect.element(screen.getByText("Label")).toHaveClass(/text-2xs/);
});

test("merges a custom className", async () => {
	const screen = await render(
		<Text className="text-muted-foreground">Hint</Text>,
	);

	const text = screen.getByText("Hint");
	await expect.element(text).toHaveClass(/text-2xs/);
	await expect.element(text).toHaveClass(/text-muted-foreground/);
});
