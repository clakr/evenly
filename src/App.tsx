import { useStore } from "@tanstack/react-form";
import { AlertDialog } from "@/components/alert-dialog";
import { ItemsBreakdownForm } from "@/components/items-breakdown-form";
import { ItemsForm } from "@/components/items-form";
import { ParticipantsForm } from "@/components/participants-form";
import { SummaryForm } from "@/components/summary-form";
import { FieldSeparator } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import { type Schema, schema } from "@/lib/schemas";

function App() {
	const form = useAppForm({
		defaultValues: {
			participants: [],
			items: [],
		} as Schema,
		validators: {
			onChange: schema,
		},
		onSubmit: ({ value }) => {
			console.log(value);
		},
	});

	const items = useStore(form.store, (state) => state.values.items);

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
						<TabsList>
							<TabsTrigger value="details">Details</TabsTrigger>
							<TabsTrigger value="summary" disabled={items.length === 0}>
								Summary
							</TabsTrigger>
						</TabsList>
						<TabsContent
							value="details"
							className="flex flex-col gap-y-[var(--gutter-block)]"
						>
							<ParticipantsForm form={form} />
							<FieldSeparator />
							<ItemsForm form={form} />
							{items.length > 0 ? (
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
