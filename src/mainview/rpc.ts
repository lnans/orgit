import { Electroview } from "electrobun/view";
import type { MainRPC } from "@/shared/types/MainRPC";
import { useRepositoryStore } from "./features/repositories/stores/repositoryStore";

const rpc = Electroview.defineRPC<MainRPC>({
	maxRequestTime: 5000,
	handlers: {
		messages: {
			onAppStateUpdate: ({ appState }) => {
				useRepositoryStore.getState().actions.setRepositories(appState.repositories);
			},
		},
	},
});

const electroview = new Electroview({ rpc });

export const mainProcess = {
	onDoubleClickTitleBar: () => electroview.rpc?.send.onDoubleClickTitleBar({}),
};
