import { Button } from "@renderer/components/Button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@renderer/components/overlays/Dialog";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

function OpenDialog({ showCloseButton = true }) {
	return (
		<Dialog open>
			<DialogContent showCloseButton={showCloseButton}>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>Manage your preferences.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

test("shows title and description when open", async () => {
	const screen = await render(<OpenDialog />);

	await expect.element(screen.getByRole("dialog")).toBeVisible();
	await expect.element(screen.getByText("Settings")).toBeInTheDocument();
	await expect
		.element(screen.getByText("Manage your preferences."))
		.toBeInTheDocument();
});

test("renders structural slots on header and title", async () => {
	const screen = await render(<OpenDialog />);

	await expect
		.element(screen.getByText("Settings"))
		.toHaveAttribute("data-slot", "dialog-title");
});

test("shows the default close control in content", async () => {
	const screen = await render(<OpenDialog />);

	await expect
		.element(screen.getByRole("button", { name: "Close" }))
		.toBeInTheDocument();
});

test("hides the content close control when showCloseButton is false", async () => {
	const screen = await render(<OpenDialog showCloseButton={false} />);

	await expect
		.element(screen.getByRole("button", { name: "Close" }))
		.not.toBeInTheDocument();
});

test("opens from the trigger", async () => {
	const screen = await render(
		<Dialog>
			<DialogTrigger render={<Button>Open dialog</Button>} />
			<DialogContent showCloseButton={false}>
				<DialogTitle>Panel</DialogTitle>
			</DialogContent>
		</Dialog>,
	);

	await screen.getByRole("button", { name: "Open dialog" }).click();

	await expect.element(screen.getByRole("dialog")).toBeVisible();
	await expect.element(screen.getByText("Panel")).toBeInTheDocument();
});

test("DialogClose renders with the dialog-close slot", async () => {
	const screen = await render(
		<Dialog open>
			<DialogContent showCloseButton={false}>
				<DialogClose render={<Button>Dismiss</Button>} />
			</DialogContent>
		</Dialog>,
	);

	await expect
		.element(screen.getByRole("button", { name: "Dismiss" }))
		.toHaveAttribute("data-slot", "dialog-close");
});

test("DialogClose closes the dialog when activated", async () => {
	const screen = await render(
		<Dialog defaultOpen modal={false}>
			<DialogContent showCloseButton={false}>
				<DialogClose render={<Button>Dismiss</Button>} />
			</DialogContent>
		</Dialog>,
	);

	await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

	await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
});

test("renders footer actions and optional footer close control", async () => {
	const screen = await render(
		<Dialog open>
			<DialogContent showCloseButton={false}>
				<DialogFooter showCloseButton>
					<Button>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>,
	);

	await expect
		.element(screen.getByRole("button", { name: "Save" }))
		.toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Close" }))
		.toBeInTheDocument();
});
