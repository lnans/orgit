import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"@main": resolve("src/main"),
		},
	},
	build: {
		ssr: true,
		outDir: "out",
		emptyOutDir: false,
		target: "node22",
		minify: false,
		rollupOptions: {
			input: {
				main: "src/main/index.ts",
				preload: "src/preload/index.ts",
			},
			output: {
				format: "cjs",
				entryFileNames: "[name]/index.js",
			},
		},
	},
});
