import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Orgit",
		identifier: "lnans.orgit.dev",
		version: "0.0.1",
	},
	runtime: {
		/** Quit is handled after user confirms in the webview dialog. */
		exitOnLastWindowClosed: false,
	},
	build: {
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
		},
		// Ignore Vite output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
			icons: "./assets/orgit.icon",
		},
		linux: {
			bundleCEF: false,
			icon: "./assets/orgit.icon.256x256.png",
		},
		win: {
			bundleCEF: false,
			icon: "./assets/orgit.icon.256x256.png",
		},
	},
} satisfies ElectrobunConfig;
