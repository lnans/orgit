const LOG_LINE_RE = /^\[[^\]]+\]\s+(DEBUG|INFO|WARN|ERROR)\s/;

const LEVEL_CLASS: Record<string, string> = {
	DEBUG: "text-muted-foreground",
	WARN: "text-orange-500 dark:text-orange-400",
	ERROR: "text-destructive",
};

export function getLogLineClassName(line: string): string {
	const match = LOG_LINE_RE.exec(line);
	if (!match) {
		return "text-sidebar-foreground";
	}

	return LEVEL_CLASS[match[1]] ?? "text-sidebar-foreground";
}
