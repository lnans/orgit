import type { RPCSchema } from "electrobun";
import type { AppStateDto } from "./AppStateDto";

export type MainRPC = {
	bun: RPCSchema<{
		messages: {
			onDoubleClickTitleBar: object;
		};
	}>;
	webview: RPCSchema<{
		messages: {
			onAppStateUpdate: {
				appState: AppStateDto;
			};
		};
	}>;
};
