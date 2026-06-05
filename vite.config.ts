import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	root: "src/mainview",
	resolve: {
		alias: {
			"@/client": path.resolve(__dirname, "src/mainview"),
			"@/shared": path.resolve(__dirname, "src/shared"),
		},
	},
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
		chunkSizeWarningLimit: 10000,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});
