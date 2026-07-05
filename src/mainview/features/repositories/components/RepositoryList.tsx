import { Fragment } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { NavbarItemEmpty } from "@/client/components/Navbar";
import { sortByKey } from "@/client/lib/utils";
import { useRepositoryStore } from "../stores/repositoryStore";
import { RepositoryItem } from "./RepositoryItem";
import { RepositoryListTitle } from "./RepositoryListTitle";
import { RepositoryWorktreeItem } from "./RepositoryWorktreeItem";

export function RepositoryList() {
	const { t } = useTranslation();
	const repositories = useRepositoryStore((state) => state.repositories);

	return (
		<div className="flex flex-col mt-2">
			<RepositoryListTitle label={t("repositories")} />
			{sortByKey(repositories, "name").map((repository) => (
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
