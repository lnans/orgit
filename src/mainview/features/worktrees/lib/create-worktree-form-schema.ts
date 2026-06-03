import type { CreateWorktreeParams } from "@shared/create-worktree";
import {
	repositoryPathBasename,
	resolveWorktreeCheckout,
} from "@shared/worktree-checkout";
import { z } from "zod";

/** Encodes {@link resolveWorktreeCheckout} errors for zod message passthrough. */
export function encodeWorktreeCheckoutError(
	error: Extract<
		ReturnType<typeof resolveWorktreeCheckout>,
		{ ok: false }
	>["error"],
): string {
	return `${error.field}:${error.reason}`;
}

export function decodeWorktreeCheckoutError(message: string): {
	field: "branch" | "folder";
	reason: string;
} | null {
	const match = message.match(/^(branch|folder):(.+)$/);
	if (!match) {
		return null;
	}
	return { field: match[1] as "branch" | "folder", reason: match[2] ?? "" };
}

export const createWorktreeFormSchema = z
	.object({
		repositoryPath: z.string().min(1),
		branchName: z.string(),
		remoteBranch: z.string(),
	})
	.superRefine((values, ctx) => {
		const repositoryBasename = repositoryPathBasename(values.repositoryPath);
		const result = resolveWorktreeCheckout(values.branchName, {
			repositoryBasename,
		});
		if (!result.ok) {
			ctx.addIssue({
				code: "custom",
				path: ["branchName"],
				message: encodeWorktreeCheckoutError(result.error),
			});
		}
	});

export const createWorktreeExistingFormSchema = z.object({
	repositoryPath: z.string().min(1),
	remoteBranch: z.string().min(1),
});

export type CreateWorktreeFormValues = z.infer<typeof createWorktreeFormSchema>;

export type CreateWorktreeExistingFormValues = z.infer<
	typeof createWorktreeExistingFormSchema
>;

export function toCreateWorktreeParams(
	values: CreateWorktreeFormValues,
): CreateWorktreeParams {
	return {
		repositoryPath: values.repositoryPath,
		branchName: values.branchName.trim(),
	};
}

export function toCreateWorktreeExistingParams(
	values: CreateWorktreeExistingFormValues,
): CreateWorktreeParams {
	return {
		mode: "existing",
		repositoryPath: values.repositoryPath,
		remoteBranch: values.remoteBranch,
	};
}
