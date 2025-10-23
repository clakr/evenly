import {
	createFormHook,
	createFormHookContexts,
	formOptions,
} from "@tanstack/react-form";
import { Input } from "@/components/form/input";
import { Radio } from "@/components/form/radio";
import { Select } from "@/components/form/select";
import type { Schema } from "@/lib/schemas";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Input,
		Select,
		Radio,
	},
	formComponents: {},
});

export const formOpts = formOptions({
	defaultValues: {
		participants: [],
		items: [],
	} as Schema,
});
