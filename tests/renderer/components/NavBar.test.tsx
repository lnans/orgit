import { Button } from "@renderer/components/Button";
import {
	NavBarItem,
	NavBarSubItem,
	NavBarTitle,
	Navbar,
} from "@renderer/components/NavBar";
import { IconFolderOpen } from "@tabler/icons-react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

test("Navbar renders children", async () => {
	const screen = await render(
		<Navbar>
			<p>Sidebar content</p>
		</Navbar>,
	);

	await expect.element(screen.getByText("Sidebar content")).toBeInTheDocument();
});

test("Navbar uses the default width", async () => {
	const screen = await render(
		<Navbar>
			<p>Sidebar</p>
		</Navbar>,
	);

	await expect
		.element(screen.getByText("Sidebar").element().parentElement)
		.toHaveStyle({
			width: "300px",
		});
});

test("NavBarTitle renders the title and trailing actions", async () => {
	const screen = await render(
		<NavBarTitle title="Repositories">
			<Button aria-label="Add repository">+</Button>
		</NavBarTitle>,
	);

	await expect.element(screen.getByText("Repositories")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Add repository" }))
		.toBeInTheDocument();
});

test("NavBarItem renders the icon, title, and trailing actions", async () => {
	const screen = await render(
		<NavBarItem title="orgit" icon={IconFolderOpen}>
			<Button aria-label="Repository menu">⋯</Button>
		</NavBarItem>,
	);

	await expect.element(screen.getByText("orgit")).toBeInTheDocument();
	await expect
		.element(screen.getByRole("button", { name: "Repository menu" }))
		.toBeInTheDocument();
});

test("NavBarSubItem renders the title and shows actions on hover", async () => {
	const screen = await render(
		<NavBarSubItem title="feature/login">
			<Button aria-label="Remove worktree">×</Button>
		</NavBarSubItem>,
	);

	await expect.element(screen.getByText("feature/login")).toBeInTheDocument();

	await userEvent.hover(screen.getByText("feature/login"));

	await expect
		.element(screen.getByRole("button", { name: "Remove worktree" }))
		.toBeVisible();
});
