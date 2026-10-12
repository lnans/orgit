import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@renderer/ipcRenderer": resolve("tests/mocks/ipcRenderer.ts"),
			"react-i18next": resolve("tests/mocks/react-i18next.ts"),
			"@renderer": resolve("src/renderer/src"),
			"@types": resolve("src/types"),
		},
		dedupe: ["react", "react-dom"],
	},
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"react/jsx-dev-runtime",
			"@base-ui/react/dialog",
			"@base-ui/react/alert-dialog",
			"@base-ui/react/button",
			"@tabler/icons-react",
		],
	},
	test: {
		include: ["tests/**/*.test.{ts,tsx}"],
		setupFiles: ["tests/setup.ts"],
		watch: false,
		coverage: {
			provider: "v8",
			include: [
				"src/renderer/src/components",
				"src/renderer/src/features",
				"src/renderer/src/hooks",
				"src/renderer/src/utils",
			],
			reportsDirectory: "./.coverage",
		},
		browser: {
			enabled: true,
			provider: playwright(),
			headless: true,
			instances: [{ browser: "chromium" }],
		},
	},
});
