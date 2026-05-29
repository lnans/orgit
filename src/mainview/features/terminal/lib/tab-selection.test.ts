import { describe, expect, test } from "bun:test";
import type { TerminalTab } from "@shared/terminal-tab";
import { resolveNextActiveTabId } from "./tab-selection";

function tab(id: string): TerminalTab {
	return { id, worktreePath: "/wt", label: id };
}

describe("resolveNextActiveTabId", () => {
	test("keeps active tab when closing another tab", () => {
		const tabs = [tab("a"), tab("b"), tab("c")];
		expect(resolveNextActiveTabId(tabs, "c", "b")).toBe("b");
	});

	test("selects next tab when closing active tab", () => {
		const tabs = [tab("a"), tab("b"), tab("c")];
		expect(resolveNextActiveTabId(tabs, "b", "b")).toBe("c");
	});

	test("selects previous tab when closing last active tab", () => {
		const tabs = [tab("a"), tab("b")];
		expect(resolveNextActiveTabId(tabs, "b", "b")).toBe("a");
	});

	test("clears active when closing the only tab", () => {
		const tabs = [tab("a")];
		expect(resolveNextActiveTabId(tabs, "a", "a")).toBeUndefined();
	});
});
