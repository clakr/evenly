import { useStore } from "@tanstack/react-form";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Select as UISelect,
} from "@/components/ui/select";
import { useFieldContext } from "@/lib/form";
import type { Option } from "@/lib/types";

type Props = {
	label: ReactNode;
	placeholder: string;
	options: Option[];
} & ComponentProps<"select">;

export function Select({ label, placeholder, options, ...props }: Props) {
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
			<UISelect
				defaultValue={field.state.value}
				onValueChange={field.handleChange}
			>
				<SelectTrigger
					id={id}
					aria-invalid={hasError}
					aria-describedby={hasError ? errorId : undefined}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</UISelect>
			{hasError ? <FieldError errors={errors} /> : null}
		</Field>
	);
}
