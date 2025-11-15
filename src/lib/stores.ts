import { create } from "zustand";
import { type Schema } from "@/lib/schemas";
import { persist } from "zustand/middleware";

export const useFormStore = create<{
  formValues: Schema | undefined;
  setFormValues: (value: Schema | undefined) => void;
}>()(
  persist(
    (set) => ({
      formValues: undefined,
      setFormValues: (value) => set({ formValues: value }),
    }),
    {
      name: "form-store",
    },
  ),
);
