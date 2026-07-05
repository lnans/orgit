import { dirname, join } from "node:path";
import z from "zod";
import type { IFsManager, ILogger, Result } from "@/server/types/server.types";
import type { AppStatePersistedDto } from "@/shared/types/AppStateDto";

const stateSchema = z.object({
	workspacePath: z.string().min(1),
});

export class AppStateManager {
	private readonly _logger: ILogger;
	private readonly _fs: IFsManager;
	private readonly _filePath: string;
	private readonly _defaults: AppStatePersistedDto;
	private _state: AppStatePersistedDto;

	public constructor(
		logger: ILogger,
		fs: IFsManager,
		stateFolderPath: string,
		defaults: AppStatePersistedDto,
	) {
		this._logger = logger;
		this._fs = fs;
		this._filePath = join(stateFolderPath, "state.json");
		this._defaults = structuredClone(defaults);
		this._state = structuredClone(defaults);
	}

	get state(): AppStatePersistedDto {
		return structuredClone(this._state);
	}

	public ensureReady(): AppStateManager {
		const mkdirResult = this._fs.mkdirSync(dirname(this._filePath));
		if (mkdirResult.isError) {
			this._logger.error("[AppStateManager] unable to create state folder", mkdirResult.error);
			throw mkdirResult.error;
		}

		const fileExists = this._fs.existsSync(this._filePath);
		if (fileExists.isError) {
			this._logger.error("[AppStateManager] unable to read state file", fileExists.error);
			throw fileExists.error;
		}

		if (fileExists.data) {
			this.loadStateFromFile();
		} else {
			this._state = structuredClone(this._defaults);
			this.saveStateToFile();
		}

		const workspaceCheckResult = this._fs.mkdirSync(this._state.workspacePath);
		if (workspaceCheckResult.isError) {
			this._logger.error(
				"[AppStateManager] unable to create workspace folder",
				workspaceCheckResult.error,
			);
			throw workspaceCheckResult.error;
		}

		this._logger.info(`[AppStateManager] state ready in ${this._filePath}`);
		this._logger.info(`[AppStateManager] workspace ready in ${this._state.workspacePath}`);
		return this;
	}

	private validate(candidate: unknown): AppStatePersistedDto {
		const parsed = stateSchema.safeParse(candidate);
		if (!parsed.success) {
			this._logger.error("[AppStateManager] validation error, keep defaults", parsed.error);
			return structuredClone(this._defaults);
		}

		return structuredClone(parsed.data);
	}

	private loadStateFromFile(): void {
		this._logger.info("[AppStateManager] reading state from disk");

		const readResult = this._fs.readFileSync(this._filePath);
		if (readResult.isError) throw readResult.error;

		const jsonResult = this._fs.parseJson(readResult.data);
		if (jsonResult.isError) {
			this._logger.error("[AppStateManager] json parse error, keep defaults", jsonResult.error);
			this._state = structuredClone(this._defaults);
			return;
		}

		this._state = this.validate(jsonResult.data);
		if (JSON.stringify(this._state) !== JSON.stringify(jsonResult.data)) {
			this.saveStateToFile();
		}
	}

	private saveStateToFile(): Result<void> {
		const jsonResult = this._fs.stringifyJson(this._state);
		if (jsonResult.isError) {
			this._logger.error("[AppStateManager] Unable to serialize state", jsonResult.error);
			return jsonResult;
		}

		const writeResult = this._fs.writeFileSync(this._filePath, jsonResult.data);
		if (writeResult.isError) {
			this._logger.error("[AppStateManager] Unable to write state file", writeResult.error);
		}

		return writeResult;
	}
}
