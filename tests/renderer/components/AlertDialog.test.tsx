import { Button } from "@renderer/components/Button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@renderer/components/overlays/AlertDialog";
import { IconAlertTriangle } from "@tabler/icons-react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

function OpenAlertDialog() {
	return (
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Quit app?</AlertDialogTitle>
					<AlertDialogDescription>
						This cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive">Quit</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

test("shows title and description when open", async () => {
	const screen = await render(<OpenAlertDialog />);

	await expect.element(screen.getByRole("alertdialog")).toBeVisible();
	await expect.element(screen.getByText("Quit app?")).toBeInTheDocument();
	await expect
		.element(screen.getByText("This cannot be undone."))
		.toBeInTheDocument();
});

test("renders structural slots on title and actions", async () => {
	const screen = await render(<OpenAlertDialog />);

	await expect
		.element(screen.getByText("Quit app?"))
		.toHaveAttribute("data-slot", "alert-dialog-title");
	await expect
		.element(screen.getByRole("button", { name: "Cancel" }))
		.toHaveAttribute("data-slot", "alert-dialog-cancel");
	await expect
		.element(screen.getByRole("button", { name: "Quit" }))
		.toHaveAttribute("data-slot", "alert-dialog-action");
});

test("opens from the trigger", async () => {
	const screen = await render(
		<AlertDialog>
			<AlertDialogTrigger render={<Button>Open alert</Button>} />
			<AlertDialogContent>
				<AlertDialogTitle>Confirm</AlertDialogTitle>
			</AlertDialogContent>
		</AlertDialog>,
	);

	await screen.getByRole("button", { name: "Open alert" }).click();

	await expect.element(screen.getByRole("alertdialog")).toBeVisible();
	await expect.element(screen.getByText("Confirm")).toBeInTheDocument();
});

test("renders the alert content slot and footer controls", async () => {
	const screen = await render(<OpenAlertDialog />);

	await expect
		.element(screen.getByRole("alertdialog"))
		.toHaveAttribute("data-slot", "alert-dialog-content");
	await expect
		.element(screen.getByRole("button", { name: "Cancel" }))
		.toBeVisible();
	await expect
		.element(screen.getByRole("button", { name: "Quit" }))
		.toBeVisible();
});

test("AlertDialogMedia renders with the media slot and children", async () => {
	const screen = await render(
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia aria-label="Alert icon">
						<IconAlertTriangle />
					</AlertDialogMedia>
					<AlertDialogTitle>Warning</AlertDialogTitle>
				</AlertDialogHeader>
			</AlertDialogContent>
		</AlertDialog>,
	);

	await expect
		.element(screen.getByLabelText("Alert icon"))
		.toHaveAttribute("data-slot", "alert-dialog-media");
	await expect.element(screen.getByText("Warning")).toBeInTheDocument();
});

test("AlertDialogMedia merges a custom className", async () => {
	const screen = await render(
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia className="custom-media">!</AlertDialogMedia>
					<AlertDialogTitle>Notice</AlertDialogTitle>
				</AlertDialogHeader>
			</AlertDialogContent>
		</AlertDialog>,
	);

	const media = screen.getByText("!");
	await expect
		.element(media)
		.toHaveAttribute("data-slot", "alert-dialog-media");
	await expect.element(media).toHaveClass(/custom-media/);
});

test("applies content size to the popup", async () => {
	const screen = await render(
		<AlertDialog open>
			<AlertDialogContent size="sm">
				<AlertDialogTitle>Small</AlertDialogTitle>
			</AlertDialogContent>
		</AlertDialog>,
	);

	await expect
		.element(screen.getByRole("alertdialog"))
		.toHaveAttribute("data-size", "sm");
});
