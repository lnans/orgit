import { mainProcess } from "@client/rpc";
import { useCallback, useState } from "react";

export function useWorktreeIdeMenu(worktreePath: string) {
	const [hasDotNetSolution, setHasDotNetSolution] = useState<boolean | null>(
		null,
	);

	const onMenuOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				setHasDotNetSolution(null);
				return;
			}

			void mainProcess
				.worktreeHasDotNetSolution({ worktreePath })
				.then((result) => {
					setHasDotNetSolution(result?.hasSolution ?? false);
				})
				.catch(() => {
					setHasDotNetSolution(false);
				});
		},
		[worktreePath],
	);

	return {
		riderDisabled: hasDotNetSolution !== true,
		onMenuOpenChange,
		openInCode: () => mainProcess.openInCode({ worktreePath }),
		openInRider: () => mainProcess.openInRider({ worktreePath }),
	};
}
