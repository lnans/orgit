import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@renderer/components/Button";
import { FieldGroup } from "@renderer/components/form/Field";
import { InputControlled } from "@renderer/components/form/InputControlled";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@renderer/components/overlays/Dialog";
import { IconFolderPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const formSchema = z.object({
	url: z.string().min(1, "form.required"),
	name: z
		.string()
		.min(1, "form.required")
		.regex(/^[A-Za-z-]+$/, "form.invalidChars"),
});

type FormSchema = z.infer<typeof formSchema>;

export function RepositoryAddForm() {
	const { t } = useTranslation();

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
		defaultValues: {
			url: "",
			name: "",
		},
	});

	function onSubmit(data: FormSchema) {
		// Do something with the form values.
		console.log(data);
	}

	return (
		<Dialog
			disablePointerDismissal
			onOpenChange={(opened) => !opened && form.reset()}
		>
			<DialogTrigger
				render={
					<Button variant="ghost" size="icon-xs">
						<IconFolderPlus />
					</Button>
				}
			/>

			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="pb-2">
					<DialogTitle>{t("repositories.new")}</DialogTitle>
					<DialogDescription>{t("repositories.clone")}</DialogDescription>
				</DialogHeader>

				<form id="form-repository-add" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<InputControlled
							control={form.control}
							name="url"
							label={t("repositories.url")}
						/>
						<InputControlled
							control={form.control}
							name="name"
							label={t("repositories.name")}
						/>
					</FieldGroup>
				</form>

				<DialogFooter>
					<DialogClose
						render={<Button variant="outline">{t("common.cancel")}</Button>}
					/>
					<Button type="submit" form="form-repository-add">
						{t("common.validate")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
