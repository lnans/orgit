import type { RPCSchema } from "electrobun";

export type MainRPC = {
	bun: RPCSchema<{
		messages: {
			onDoubleClickTitleBar: object;
		};
	}>;
	webview: RPCSchema<{
		messages: Record<string, never>;
	}>;
};
