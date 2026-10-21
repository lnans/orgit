import { join } from "node:path";
import { app } from "electron";

const env = app.isPackaged ? "" : ".dev";
const appId = `com.lnans.orgit${env}`;
const appName = `Orgit${env}`;

const appData = join(app.getPath("appData"), appName);
const appLogs = join(appData, "logs");

app.setName(appName);
app.setPath("userData", appData);

export const Constants = {
	appId,
	appData,
	appLogs,
};
