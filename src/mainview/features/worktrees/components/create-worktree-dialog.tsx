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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@client/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "@shared/create-worktree";
import type { Repository } from "@shared/types";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRemoteBranchesForWorktree } from "../hooks/use-remote-branches-for-worktree";
import {
	type CreateWorktreeExistingFormValues,
	type CreateWorktreeFormValues,
	createWorktreeExistingFormSchema,
	createWorktreeFormSchema,
	toCreateWorktreeExistingParams,
	toCreateWorktreeParams,
} from "../lib/create-worktree-form-schema";
import type { CreateWorktreeDialogDefaults } from "../store-create-dialog";
import { RemoteBranchSelectItems } from "./remote-branch-select-items";
import { WorktreeBranchFieldHint } from "./worktree-branch-field-hint";

type CreateWorktreeTab = "new" | "existing";

type CreateWorktreeDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	repositories: Repository[];
	defaults?: CreateWorktreeDialogDefaults;
	onSubmit: (params: CreateWorktreeParams) => void;
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
	const [activeTab, setActiveTab] = useState<CreateWorktreeTab>("new");

	const form = useForm<CreateWorktreeFormValues>({
		resolver: zodResolver(createWorktreeFormSchema),
		defaultValues: {
			repositoryPath: defaults?.repositoryPath ?? "",
			branchName: "",
			remoteBranch: "",
		},
	});

	const repositoryPath = form.watch("repositoryPath");
	const branchName = form.watch("branchName");
	const remoteBranch = form.watch("remoteBranch");
	const hasRepositories = repositories.length > 0;

	const {
		branches,
		loading: branchesLoading,
		loadError,
	} = useRemoteBranchesForWorktree(
		repositoryPath,
		open && activeTab === "existing",
	);

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

	const selectedRemoteBranch = useMemo(
		() => branches.find((branch) => branch.ref === remoteBranch),
		[branches, remoteBranch],
	);

	const remoteBranchItems = useMemo(
		() =>
			branches.map((branch) => ({
				value: branch.ref,
				label: branch.branchName,
			})),
		[branches],
	);

	const branchNameInputRef = useRef<HTMLInputElement | null>(null);
	const { ref: branchNameFieldRef, ...branchNameField } =
		form.register("branchName");

	useEffect(() => {
		if (!open) {
			return;
		}
		setActiveTab("new");
		form.reset({
			repositoryPath: defaults?.repositoryPath ?? repositories[0]?.path ?? "",
			branchName: "",
			remoteBranch: "",
		});
	}, [open, defaults?.repositoryPath, form, repositories]);

	useEffect(() => {
		if (
			remoteBranch &&
			!branches.some((branch) => branch.ref === remoteBranch)
		) {
			form.setValue("remoteBranch", "");
		}
	}, [branches, form, remoteBranch]);

	useEffect(() => {
		if (!open || !hasRepositories || activeTab !== "new") {
			return;
		}
		const frame = requestAnimationFrame(() => {
			branchNameInputRef.current?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [open, hasRepositories, activeTab]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSubmitting && !nextOpen) {
			return;
		}
		onOpenChange(nextOpen);
	};

	const submitNewBranch = form.handleSubmit((values) => {
		onSubmit(toCreateWorktreeParams(values));
	});

	const submitExistingBranch = () => {
		const values: CreateWorktreeExistingFormValues = {
			repositoryPath,
			remoteBranch,
		};
		const parsed = createWorktreeExistingFormSchema.safeParse(values);
		if (!parsed.success) {
			return;
		}
		onSubmit(toCreateWorktreeExistingParams(parsed.data));
	};

	const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (activeTab === "existing") {
			submitExistingBranch();
			return;
		}
		void submitNewBranch();
	};

	const canSubmitExisting =
		Boolean(repositoryPath) &&
		Boolean(remoteBranch) &&
		!branchesLoading &&
		loadError === null;

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
					<form className="flex flex-col gap-3" onSubmit={handleFormSubmit}>
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

						<Tabs
							value={activeTab}
							onValueChange={(value) =>
								setActiveTab(value as CreateWorktreeTab)
							}
						>
							<TabsList className="w-full">
								<TabsTrigger className="flex-1" value="new">
									{t("createWorktree.tabNewBranch")}
								</TabsTrigger>
								<TabsTrigger className="flex-1" value="existing">
									{t("createWorktree.tabExistingBranch")}
								</TabsTrigger>
							</TabsList>

							<TabsContent value="new" className="mt-3 flex flex-col gap-1.5">
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
							</TabsContent>

							<TabsContent
								value="existing"
								className="mt-3 flex flex-col gap-1.5"
							>
								<label
									className="text-xs font-medium"
									htmlFor="create-worktree-remote-branch"
								>
									{t("createWorktree.remoteBranch")}
								</label>
								<Controller
									control={form.control}
									name="remoteBranch"
									render={({ field }) => (
										<Select
											value={field.value}
											onValueChange={field.onChange}
											items={remoteBranchItems}
											disabled={
												isSubmitting ||
												!repositoryPath ||
												branchesLoading ||
												branches.length === 0
											}
										>
											<SelectTrigger
												id="create-worktree-remote-branch"
												className="w-full"
											>
												<SelectValue
													placeholder={
														branchesLoading
															? t("createWorktree.remoteBranchLoading")
															: t("createWorktree.remoteBranchPlaceholder")
													}
												/>
											</SelectTrigger>
											<SelectContent>
												<RemoteBranchSelectItems branches={branches} />
											</SelectContent>
										</Select>
									)}
								/>
								{loadError ? (
									<p className="text-[10px] text-destructive">
										{t(`createWorktree.remoteBranchError.${loadError}`)}
									</p>
								) : null}
								{!loadError &&
								!branchesLoading &&
								repositoryPath &&
								branches.length === 0 ? (
									<p className="text-[10px] text-muted-foreground">
										{t("createWorktree.noRemoteBranches")}
									</p>
								) : null}
								{selectedRemoteBranch ? (
									<WorktreeBranchFieldHint
										value={selectedRemoteBranch.branchName}
										repositoryBasename={repositoryBasename}
									/>
								) : null}
							</TabsContent>
						</Tabs>

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
							<Button
								type="submit"
								disabled={
									isSubmitting ||
									!repositoryPath ||
									(activeTab === "new" ? false : !canSubmitExisting)
								}
							>
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
