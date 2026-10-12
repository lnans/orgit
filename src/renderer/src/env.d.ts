/// <reference types="vite/client" />

import type { MainApi } from "@shared/interfaces/Ipc";

declare global {
	interface Window {
		api: MainApi;
	}
}
