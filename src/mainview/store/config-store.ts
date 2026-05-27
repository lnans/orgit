import type { AppConfig } from "@shared/config";
import { DEFAULT_APP_CONFIG } from "@shared/config";
import { create } from "zustand";

type ConfigStore = {
	config: AppConfig;
	syncConfig: (config: AppConfig) => void;
};

export const useConfigStore = create<ConfigStore>()((set) => ({
	config: structuredClone(DEFAULT_APP_CONFIG),
	syncConfig: (config) => set({ config }),
}));

export function useTerminalConfig() {
	return useConfigStore((state) => state.config.terminal);
}
