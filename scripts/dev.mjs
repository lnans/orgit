import { spawn } from "node:child_process";
import { resolve, sep } from "node:path";
import electron from "electron";
import { build, createServer } from "vite";

const server = await createServer({ configFile: "vite.config.mts" });
await server.listen();
server.printUrls();

const preloadDir = resolve("src/preload") + sep;
let child = null;
let changedFiles = [];

function startElectron() {
	const proc = spawn(electron, ["."], {
		stdio: "inherit",
		env: {
			...process.env,
			ELECTRON_RENDERER_URL: server.resolvedUrls.local[0],
		},
	});
	proc.on("close", async (code) => {
		if (proc.killedForRestart) return;
		await server.close();
		process.exit(code ?? 0);
	});
	child = proc;
}

function restartElectron() {
	child.killedForRestart = true;
	child.kill();
	startElectron();
}

const watcher = await build({
	configFile: "vite.main.config.mts",
	mode: "development",
	build: { watch: {} },
});

watcher.on("change", (id) => changedFiles.push(id));

watcher.on("event", (event) => {
	if (event.code === "ERROR") {
		console.error(event.error);
	} else if (event.code === "END") {
		const onlyPreload =
			changedFiles.length > 0 &&
			changedFiles.every((id) => id.startsWith(preloadDir));
		changedFiles = [];

		if (!child) startElectron();
		else if (onlyPreload) server.ws.send({ type: "full-reload" });
		else restartElectron();
	}
	if (event.result) event.result.close();
});
