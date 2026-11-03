import { Input } from "@renderer/components/inputs/Input";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";

type InputControlledProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "render"> & {
	className?: string;
	label?: string;
	description?: string;
};

export function InputControlled<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	className,
	label,
	description,
	...props
}: InputControlledProps<TFieldValues, TName>) {
	const { t } = useTranslation();

	return (
		<Controller
			{...props}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
					<Input
						{...field}
						id={field.name}
						aria-invalid={fieldState.invalid}
						autoComplete="off"
					/>
					{!!description && <FieldDescription>{description}</FieldDescription>}
					{fieldState.invalid && (
						<FieldError error={t(fieldState.error?.message ?? "")} />
					)}
				</Field>
			)}
		/>
	);
}
