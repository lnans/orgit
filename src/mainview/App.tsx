import {
	IconFolderOpen,
	IconFolderPlus,
	IconGitBranch,
	IconGitFork,
	IconRefresh,
	IconTerminal2,
	IconTrash,
} from "@tabler/icons-react";
import { AppHeader } from "./components/ui/AppHeader";
import { ButtonIcon } from "./components/ui/ButtonIcon";
import {
	Navbar,
	NavbarItem,
	NavbarItemEmpty,
	NavbarSubItem,
	NavbarTitle,
} from "./components/ui/Navbar";

export default function App() {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-main">
			<AppHeader />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<NavbarTitle label="Repositories">
						<ButtonIcon icon={IconFolderPlus} />
					</NavbarTitle>

					<NavbarItem
						description="main"
						iconDescription={IconGitBranch}
						iconLabel={IconFolderOpen}
						label="repo-1"
					>
						<ButtonIcon icon={IconRefresh} />
						<ButtonIcon icon={IconGitFork} />
					</NavbarItem>
					<NavbarItemEmpty label="No worktree yet" />

					<NavbarItem
						description="main"
						iconDescription={IconGitBranch}
						iconLabel={IconFolderOpen}
						label="repo-2"
					>
						<ButtonIcon icon={IconRefresh} />
						<ButtonIcon icon={IconGitFork} />
					</NavbarItem>
					<NavbarSubItem label="feature/branch-1">
						<ButtonIcon icon={IconTrash} variant="ghost" />
						<ButtonIcon icon={IconTerminal2} variant="ghost" />
					</NavbarSubItem>
				</Navbar>
				<div className="w-full overflow-auto">content</div>
			</div>
		</div>
	);
}
