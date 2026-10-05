import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import { i18next } from "./lib/i18n";

// biome-ignore lint: react
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<I18nextProvider i18n={i18next}>
			<App />
		</I18nextProvider>
	</StrictMode>,
);
