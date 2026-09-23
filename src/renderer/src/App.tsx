import { useState } from "react";

function App(): React.JSX.Element {
	const [count, setCount] = useState(0);
	const { versions } = window.electron.process;

	const ping = (): void => {
		window.electron.ipcRenderer.send("ping");
		setCount((c) => c + 1);
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-900 text-zinc-100">
			<h1 className="text-3xl font-bold">Hello from React in Electron!</h1>
			<p className="text-sm text-zinc-400 font-jet">
				Chrome v{versions.chrome}, Node.js v{versions.node}, Electron v
				{versions.electron}
			</p>
			<button
				type="button"
				onClick={ping}
				className="rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400"
			>
				Send ping ({count})
			</button>
		</main>
	);
}

export default App;
