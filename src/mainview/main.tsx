import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import { i18next } from "./lib/i18n";

// biome-ignore lint/style/noNonNullAssertion: react
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<I18nextProvider i18n={i18next}>
			<App />
		</I18nextProvider>
	</StrictMode>,
);
