import { Electroview } from "electrobun/view";
import type { MainRPC } from "@/shared/types/MainRPC";

const rpc = Electroview.defineRPC<MainRPC>({
	maxRequestTime: 5000,
	handlers: {},
});

const electroview = new Electroview({ rpc });

export const mainProcess = {
	onDoubleClickTitleBar: () => electroview.rpc?.send.onDoubleClickTitleBar({}),
};
