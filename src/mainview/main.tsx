import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: react
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<div />
	</StrictMode>,
);
