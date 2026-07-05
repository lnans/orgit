import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function sortByKey<T>(arr: Array<T>, key: keyof T) {
	return [...arr].sort((a, b) => {
		const valA = a?.[key] ?? "";
		const valB = b?.[key] ?? "";
		const result = String(valA).localeCompare(String(valB));
		return result;
	});
}
