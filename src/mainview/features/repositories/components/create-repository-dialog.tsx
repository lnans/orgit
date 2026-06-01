import { Button } from "@client/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@client/components/ui/dialog";
import { Input } from "@client/components/ui/input";
import { FolderNameFieldHint } from "@client/lib/folder-name-field-hint";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateRepositoryResult } from "@shared/create-repository";
import { deriveRepositoryFolderName } from "@shared/repository-folder-name";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	type CreateRepositoryFormValues,
	createRepositoryFormSchema,
} from "../lib/create-repository-form-schema";

type CreateRepositoryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: CreateRepositoryFormValues) => void;
	isSubmitting: boolean;
	submitError: CreateRepositoryResult | null;
};

function CreateRepositoryDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
	submitError,
}: CreateRepositoryDialogProps) {
	const { t } = useTranslation();
	const lastSuggestedFolder = useRef<string | null>(null);

	const form = useForm<CreateRepositoryFormValues>({
		resolver: zodResolver(createRepositoryFormSchema),
		defaultValues: { source: "", folderName: "" },
	});

	const source = form.watch("source");
	const folderName = form.watch("folderName");

	useEffect(() => {
		if (!open) {
			return;
		}
		lastSuggestedFolder.current = null;
		form.reset({ source: "", folderName: "" });
	}, [open, form]);

	useEffect(() => {
		if (!open) {
			return;
		}
		const trimmedSource = source?.trim() ?? "";
		if (trimmedSource.length === 0) {
			return;
		}

		const derived = deriveRepositoryFolderName(trimmedSource);
		if (!derived.ok) {
			const currentFolder = form.getValues("folderName");
			if (
				!currentFolder.trim() ||
				currentFolder === lastSuggestedFolder.current
			) {
				form.setValue("folderName", "", { shouldValidate: true });
				lastSuggestedFolder.current = null;
			}
			return;
		}

		const currentFolder = form.getValues("folderName");
		if (
			!currentFolder.trim() ||
			currentFolder === lastSuggestedFolder.current
		) {
			form.setValue("folderName", derived.value, { shouldValidate: true });
			lastSuggestedFolder.current = derived.value;
		}
	}, [open, source, form]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSubmitting && !nextOpen) {
			return;
		}
		onOpenChange(nextOpen);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			disablePointerDismissal={isSubmitting}
		>
			<DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
				<DialogHeader>
					<DialogTitle>{t("createRepository.title")}</DialogTitle>
					<DialogDescription>
						{t("createRepository.description")}
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex flex-col gap-3"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex flex-col gap-1.5">
						<label
							className="text-xs font-medium"
							htmlFor="create-repository-source"
						>
							{t("createRepository.source")}
						</label>
						<Input
							id="create-repository-source"
							autoComplete="off"
							disabled={isSubmitting}
							aria-invalid={Boolean(form.formState.errors.source)}
							{...form.register("source")}
						/>
						{form.formState.errors.source?.message === "empty_source" ? (
							<p className="text-[10px] text-destructive">
								{t("createRepository.error.empty_source")}
							</p>
						) : null}
					</div>

					<div className="flex flex-col gap-1.5">
						<label
							className="text-xs font-medium"
							htmlFor="create-repository-folder-name"
						>
							{t("createRepository.folderName")}
						</label>
						<Input
							id="create-repository-folder-name"
							autoComplete="off"
							disabled={isSubmitting}
							aria-invalid={Boolean(form.formState.errors.folderName)}
							{...form.register("folderName")}
						/>
						<FolderNameFieldHint
							value={folderName ?? ""}
							normalizedLabelKey="createRepository.normalizedFolder"
						/>
					</div>

					{submitError && !submitError.ok ? (
						<p className="text-[10px] text-destructive">
							{t(`createRepository.error.${submitError.error}`, {
								detail: submitError.detail ?? "",
							})}
						</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isSubmitting}
							onClick={() => handleOpenChange(false)}
						>
							{t("createRepository.cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? t("createRepository.submitting")
								: t("createRepository.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export { CreateRepositoryDialog };
