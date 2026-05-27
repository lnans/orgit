import { startApp } from "./app";
import { initLogger } from "./lib/logger";

initLogger();
await startApp();
