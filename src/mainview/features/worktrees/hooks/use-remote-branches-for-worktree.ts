import { mainProcess } from "@client/rpc";
import type {
	ListRemoteBranchesErrorCode,
	RemoteBranchOption,
} from "@shared/list-remote-branches";
import { useEffect, useState } from "react";

type UseRemoteBranchesForWorktreeResult = {
	branches: RemoteBranchOption[];
	loading: boolean;
	loadError: ListRemoteBranchesErrorCode | null;
};

/** Loads remote branches available for an existing-branch worktree checkout. */
export function useRemoteBranchesForWorktree(
	repositoryPath: string,
	enabled: boolean,
): UseRemoteBranchesForWorktreeResult {
	const [branches, setBranches] = useState<RemoteBranchOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] =
		useState<ListRemoteBranchesErrorCode | null>(null);

	useEffect(() => {
		if (!enabled || !repositoryPath) {
			setBranches([]);
			setLoadError(null);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setLoadError(null);

		void mainProcess
			.listRemoteBranchesForWorktree({ repositoryPath })
			.then((result) => {
				if (cancelled) {
					return;
				}
				setLoading(false);
				if (!result) {
					return;
				}
				if (result.ok) {
					setBranches(result.branches);
					setLoadError(null);
				} else {
					setBranches([]);
					setLoadError(result.error);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [repositoryPath, enabled]);

	return { branches, loading, loadError };
}
