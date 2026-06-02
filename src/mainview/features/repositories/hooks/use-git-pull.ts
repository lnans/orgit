import { useLogStore } from "@client/features/logs/store";
import { mainProcess } from "@client/rpc";
import { useGitPullStore } from "../store-git-pull";

/** Runs `git pull --rebase` on the current branch at `checkoutPath`; output goes to the log panel. */
export function useGitPull() {
	const start = useGitPullStore((state) => state.start);

	return (checkoutPath: string, loadingKey: string) => {
		if (useGitPullStore.getState().isLoading(loadingKey)) {
			return;
		}

		start(loadingKey);
		useLogStore.getState().setOpen(true);
		mainProcess.gitPull({ checkoutPath, loadingKey });
	};
}
