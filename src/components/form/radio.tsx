import { useStore } from "@tanstack/react-form";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/lib/form";
import type { Option } from "@/lib/types";

type Props = {
	label: ReactNode;
	options: Option[];
} & ComponentProps<typeof RadioGroup>;

export function Radio({ label, options, ...props }: Props) {
	const field = useFieldContext<string>();

	const id = useId();
	const errorId = `${id}-error`;

	const hasError = useStore(
		field.store,
		(state) => state.meta.isTouched && !state.meta.isValid,
	);
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field data-invalid={hasError}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<RadioGroup
				defaultValue={field.state.value}
				onValueChange={field.handleChange}
				aria-invalid={hasError}
				aria-describedby={hasError ? errorId : undefined}
				{...props}
			>
				{options.map((option) => (
					<div className="flex items-center space-x-2">
						<RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
						<FieldLabel
							htmlFor={`${id}-${option.value}`}
							className="capitalize"
						>
							{option.label}
						</FieldLabel>
					</div>
				))}
			</RadioGroup>
			{hasError ? <FieldError errors={errors} /> : null}
		</Field>
	);
}
