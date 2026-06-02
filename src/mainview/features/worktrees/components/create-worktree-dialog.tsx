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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@client/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateWorktreeResult } from "@shared/create-worktree";
import type { Repository } from "@shared/types";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	type CreateWorktreeFormValues,
	createWorktreeFormSchema,
} from "../lib/create-worktree-form-schema";
import type { CreateWorktreeDialogDefaults } from "../store-create-dialog";
import { WorktreeBranchFieldHint } from "./worktree-branch-field-hint";

type CreateWorktreeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	repositories: Repository[];
	defaults?: CreateWorktreeDialogDefaults;
	onSubmit: (values: CreateWorktreeFormValues) => void;
	isSubmitting: boolean;
	submitError: CreateWorktreeResult | null;
};

function CreateWorktreeDialog({
	open,
	onOpenChange,
	repositories,
	defaults,
	onSubmit,
	isSubmitting,
	submitError,
}: CreateWorktreeDialogProps) {
	const { t } = useTranslation();

	const form = useForm<CreateWorktreeFormValues>({
		resolver: zodResolver(createWorktreeFormSchema),
		defaultValues: {
			repositoryPath: defaults?.repositoryPath ?? "",
			branchName: "",
		},
	});

	const repositoryPath = form.watch("repositoryPath");
	const branchName = form.watch("branchName");
	const hasRepositories = repositories.length > 0;

	const repositoryItems = useMemo(
		() =>
			repositories.map((repository) => ({
				value: repository.path,
				label: repository.name,
			})),
		[repositories],
	);

	const repositoryBasename = useMemo(() => {
		return repositories.find((r) => r.path === repositoryPath)?.name;
	}, [repositories, repositoryPath]);

	const branchNameInputRef = useRef<HTMLInputElement | null>(null);
	const { ref: branchNameFieldRef, ...branchNameField } =
		form.register("branchName");

	useEffect(() => {
		if (!open) {
			return;
		}
		form.reset({
			repositoryPath: defaults?.repositoryPath ?? repositories[0]?.path ?? "",
			branchName: "",
		});
	}, [open, defaults?.repositoryPath, form, repositories]);

	useEffect(() => {
		if (!open || !hasRepositories) {
			return;
		}
		const frame = requestAnimationFrame(() => {
			branchNameInputRef.current?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [open, hasRepositories]);

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
					<DialogTitle>{t("createWorktree.title")}</DialogTitle>
					<DialogDescription>
						{t("createWorktree.description")}
					</DialogDescription>
				</DialogHeader>

				{!hasRepositories ? (
					<p className="text-xs text-muted-foreground">
						{t("createWorktree.noRepositories")}
					</p>
				) : (
					<form
						className="flex flex-col gap-3"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<div className="flex flex-col gap-1.5">
							<label
								className="text-xs font-medium"
								htmlFor="create-worktree-repository"
							>
								{t("createWorktree.repository")}
							</label>
							<Controller
								control={form.control}
								name="repositoryPath"
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
										items={repositoryItems}
										disabled={isSubmitting}
									>
										<SelectTrigger
											id="create-worktree-repository"
											className="w-full"
										>
											<SelectValue
												placeholder={t("createWorktree.repositoryPlaceholder")}
											/>
										</SelectTrigger>
										<SelectContent>
											{repositories.map((repository) => (
												<SelectItem
													key={repository.path}
													value={repository.path}
												>
													{repository.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								className="text-xs font-medium"
								htmlFor="create-worktree-branch-name"
							>
								{t("createWorktree.branchName")}
							</label>
							<Input
								id="create-worktree-branch-name"
								autoComplete="off"
								disabled={isSubmitting || !repositoryPath}
								aria-invalid={Boolean(form.formState.errors.branchName)}
								ref={(node) => {
									branchNameFieldRef(node);
									branchNameInputRef.current = node;
								}}
								{...branchNameField}
							/>
							<WorktreeBranchFieldHint
								value={branchName ?? ""}
								repositoryBasename={repositoryBasename}
							/>
						</div>

						{submitError && !submitError.ok ? (
							<p className="text-[10px] text-destructive">
								{t(`createWorktree.error.${submitError.error}`, {
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
								{t("createWorktree.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting || !repositoryPath}>
								{isSubmitting
									? t("createWorktree.submitting")
									: t("createWorktree.submit")}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}

export { CreateWorktreeDialog };
