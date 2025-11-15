import { useStore } from "@tanstack/react-form";
import { RefreshCcwIcon } from "lucide-react";
import { useEffect } from "react";
import { AlertDialog } from "@/components/alert-dialog";
import { ItemsBreakdownForm } from "@/components/items-breakdown-form";
import { ItemsForm } from "@/components/items-form";
import { ParticipantsForm } from "@/components/participants-form";
import { SummaryForm } from "@/components/summary-form";
import { FieldSeparator } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import { schema } from "@/lib/schemas";
import { Button } from "./components/ui/button";
import { useFormStore } from "./lib/stores";
import { useAlert } from "./lib/use-alert";

function App() {
	const { formValues, setFormValues, resetFormValues } = useFormStore();

	const form = useAppForm({
		defaultValues: formValues,
		validators: {
			onChange: schema,
		},
	});

	const values = useStore(form.store, (state) => state.values);

	useEffect(() => {
		setFormValues(values);
	}, [setFormValues, values]);

	const { show } = useAlert();

	function handleReset() {
		show({
			title: "Reset Form",
			description: "Are you sure you want to reset the form?",
			actionText: "Yes, Reset Form",
			cancelText: "No, Cancel",
			onAction: () => {
				form.reset();
				resetFormValues();
			},
		});
	}

	return (
		<>
			<main className="max-w-3xl mx-auto p-6 flex flex-col gap-y-[var(--gutter-block)] [--gutter-block:theme(spacing.6)]">
				<h1 className="text-5xl font-bold">evenly</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<Tabs defaultValue="details" className="gap-y-[var(--gutter-block)]">
						<section className="flex items-center justify-between">
							<TabsList>
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger
									value="summary"
									disabled={values.items.length === 0}
								>
									Summary
								</TabsTrigger>
							</TabsList>
							<Button
								variant="secondary"
								size="sm"
								className="self-end gap-x-2"
								onClick={handleReset}
							>
								<RefreshCcwIcon className="size-3" />
								Reset
							</Button>
						</section>

						<TabsContent
							value="details"
							className="flex flex-col gap-y-[var(--gutter-block)]"
						>
							<ParticipantsForm form={form} />
							<FieldSeparator />
							<ItemsForm form={form} />
							{values.items.length > 0 ? (
								<>
									<FieldSeparator />
									<ItemsBreakdownForm form={form} />
								</>
							) : null}
						</TabsContent>
						<TabsContent
							value="summary"
							className="grid gap-y-[var(--gutter-block)] font-mono"
						>
							<SummaryForm form={form} />
						</TabsContent>
					</Tabs>
				</form>
			</main>

			<AlertDialog />
		</>
	);
}

export default App;
