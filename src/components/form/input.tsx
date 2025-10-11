import { useStore } from "@tanstack/react-form";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input as UIInput } from "@/components/ui/input";
import { useFieldContext } from "@/lib/form";

type Props = {
	label: ReactNode;
	orientation?: ComponentProps<typeof Field>["orientation"];
} & ComponentProps<"input">;

export function Input({ label, type, orientation = "vertical" }: Props) {
	const field = useFieldContext<string | number>();

	const id = useId();
	const errorId = `${id}-error`;

	const hasError = useStore(
		field.store,
		(state) => state.meta.isTouched && !state.meta.isValid,
	);
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field data-invalid={hasError} orientation={orientation}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<UIInput
				id={id}
				type={type}
				value={field.state.value}
				onChange={(e) => {
					let value;

					if (type === "number") {
						value = e.target.valueAsNumber;
					} else {
						value = e.target.value;
					}

					field.handleChange(value);
				}}
				onBlur={field.handleBlur}
				aria-invalid={hasError}
				aria-describedby={hasError ? errorId : undefined}
			/>
			{hasError ? <FieldError errors={errors} /> : null}
		</Field>
	);
}
