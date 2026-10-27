import { NavBarTitle } from "@renderer/components/layout/NavBar";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRepositories } from "../stores/repositoriesStore";
import { RepositoryAddForm } from "./RepositoryAddForm";
import { RepositoryItem } from "./RepositoryItem";
import { RepositoryWorktreeItem } from "./RepositoryWorktreeItem";

export function RepositoriesList() {
	const { t } = useTranslation();
	const repositories = useRepositories();

	return (
		<>
			<NavBarTitle title={t("repositories.title")}>
				<RepositoryAddForm />
			</NavBarTitle>

			{repositories.map((repo) => (
				<React.Fragment key={repo.path}>
					<RepositoryItem repository={repo} />
					<div className="flex flex-col">
						{repo.worktrees.map((worktree) => (
							<RepositoryWorktreeItem key={worktree.path} worktree={worktree} />
						))}
					</div>
				</React.Fragment>
			))}
		</>
	);
}
