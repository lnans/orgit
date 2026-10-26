import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const mainAliases = {
	"@main": resolve("src/main"),
};

const rendererAliases = {
	"@renderer/ipcRenderer": resolve("tests/mocks/ipcRenderer.ts"),
	"react-i18next": resolve("tests/mocks/react-i18next.ts"),
	"@renderer": resolve("src/renderer/src"),
	"@types": resolve("src/types"),
};

export default defineConfig({
	test: {
		watch: false,
		coverage: {
			provider: "v8",
			include: [
				"src/renderer/src/components",
				"src/renderer/src/features",
				"src/renderer/src/hooks",
				"src/renderer/src/utils",
				"src/main/features",
			],
			reportsDirectory: "./.coverage",
		},
		// Browser mode cannot host Node filesystem tests, so main and renderer
		// run as separate projects. A config that declares projects does not
		// run tests itself.
		projects: [
			{
				resolve: {
					alias: mainAliases,
				},
				test: {
					name: "main",
					environment: "node",
					include: ["tests/main/**/*.test.ts"],
				},
			},
			{
				plugins: [react()],
				resolve: {
					alias: rendererAliases,
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
					name: "renderer",
					include: ["tests/**/*.test.{ts,tsx}"],
					exclude: [...configDefaults.exclude, "tests/main/**"],
					setupFiles: ["tests/setup.ts"],
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
	},
});
