import type { CreateRepositoryParams } from "@shared/create-repository";
import {
	type NormalizeFolderNameErrorReason,
	normalizeFolderName,
} from "@shared/folder-name";
import { z } from "zod";

export const createRepositoryFormSchema = z.object({
	source: z.string().trim().min(1, { message: "empty_source" }),
	folderName: z.string().superRefine((value, ctx) => {
		const result = normalizeFolderName(value);
		if (!result.ok) {
			ctx.addIssue({
				code: "custom",
				message: result.error.reason satisfies NormalizeFolderNameErrorReason,
			});
		}
	}),
});

export type CreateRepositoryFormValues = z.infer<
	typeof createRepositoryFormSchema
>;

export function toCreateRepositoryParams(
	values: CreateRepositoryFormValues,
): CreateRepositoryParams {
	return {
		source: values.source.trim(),
		folderName: values.folderName.trim(),
	};
}
