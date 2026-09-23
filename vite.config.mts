import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: "src/renderer",
	base: "./",
	plugins: [
		react(),
		tailwindcss(),
		{
			name: "dev-csp",
			apply: "serve",
			transformIndexHtml: (html) =>
				html.replace(
					"script-src 'self'",
					"script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
				),
		},
	],
	resolve: {
		alias: {
			"@renderer": resolve("src/renderer/src"),
		},
	},
	build: {
		outDir: resolve("out/renderer"),
		emptyOutDir: true,
	},
});
