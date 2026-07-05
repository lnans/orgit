import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { NavbarItemEmpty } from "@/client/components/ui/Navbar";
import { sortByKey } from "@/client/lib/utils";
import type { RepositoryDto } from "@/shared/types/RepositoryDto";
import { RepositoryItem } from "./RepositoryItem";
import { RepositoryListTitle } from "./RepositoryListTitle";
import { RepositoryWorktreeItem } from "./RepositoryWorktreeItem";

const mock: RepositoryDto[] = [
	{
		name: "repo-1",
		branch: "main",
		path: "/none/repo-1",
		worktrees: [],
	},
	{
		name: "repo-2",
		branch: "main",
		path: "/none/repo-2",
		worktrees: [
			{
				name: "feature/branch-2",
				path: "/none/branch-2",
				filesModified: 0,
				linesAdded: 0,
				linesRemoved: 0,
			},
			{
				name: "feature/branch-1",
				path: "/none/branch-1",
				filesModified: 0,
				linesAdded: 0,
				linesRemoved: 0,
			},
		],
	},
];

export function RepositoryList() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col mt-2">
			<RepositoryListTitle label={t("repositories")} />
			{sortByKey(mock, "name").map((repository) => (
				<Fragment key={repository.path}>
					<RepositoryItem
						branch={repository.branch}
						name={repository.name}
						path={repository.path}
					/>
					{sortByKey(repository.worktrees, "name").map((worktree) => (
						<RepositoryWorktreeItem key={worktree.path} name={worktree.name} path={worktree.path} />
					))}
					{!repository.worktrees.length && <NavbarItemEmpty label={t("worktree_empty")} />}
				</Fragment>
			))}
		</div>
	);
}
