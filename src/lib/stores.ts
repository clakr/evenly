import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Schema } from "@/lib/schemas";

const DEFAULT_FORM_VALUES = {
	items: [],
	participants: [],
};

export const useFormStore = create<{
	formValues: Schema;
	setFormValues: (value: Schema) => void;
	resetFormValues: () => void;
}>()(
	persist(
		(set) => ({
			formValues: DEFAULT_FORM_VALUES,
			setFormValues: (value) => set({ formValues: value }),
			resetFormValues: () => set({ formValues: DEFAULT_FORM_VALUES }),
		}),
		{
			name: "form-store",
		},
	),
);
