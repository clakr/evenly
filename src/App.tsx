import { useStore } from "@tanstack/react-form";
import { ItemsSection } from "@/components/items-section";
import { ParticipantsSection } from "@/components/participants-section";
import { SummarySection } from "@/components/summary-section";
import { FieldSeparator } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import {
	createEmptyItem,
	createEmptyParticipant,
	type ItemInput,
	type Participant,
	type Schema,
	schema,
} from "@/lib/schemas";

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

	/**
	 * participants
	 */

	const participants = useStore(
		form.store,
		(state) => state.values.participants,
	);

	function handleAddParticipant(name: Participant["name"]) {
		form.pushFieldValue(
			"participants",
			createEmptyParticipant({
				name,
			}),
		);
	}

	function handleRemoveParticipant(index: number) {
		form.removeFieldValue("participants", index);
	}

	function handleUpdateParticipant(index: number, name: Participant["name"]) {
		const participant = participants[index];

		form.replaceFieldValue("participants", index, {
			...participant,
			name,
		});
	}

	function handleRemoveAllParticipants() {
		form.setFieldValue("participants", []);
	}

	/**
	 * items
	 */
	const items = useStore(form.store, (state) => state.values.items);

	function handleAddItem(payload: Partial<ItemInput> = {}) {
		form.pushFieldValue("items", createEmptyItem(payload));
	}

	return (
		<main className="max-w-3xl mx-auto p-6 flex flex-col gap-y-[var(--gutter-block)] [--gutter-block:theme(spacing.8)]">
			<h1 className="text-5xl font-bold">evenly</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Tabs defaultValue="details" className="gap-y-4">
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
						<ParticipantsSection
							participants={participants}
							addParticipant={handleAddParticipant}
							removeParticipant={handleRemoveParticipant}
							updateParticipant={handleUpdateParticipant}
							removeAllParticipants={handleRemoveAllParticipants}
						/>
						{participants.length > 0 ? (
							<>
								<FieldSeparator />
								<ItemsSection
									participants={participants}
									addItem={handleAddItem}
								/>
							</>
						) : null}
					</TabsContent>
					<TabsContent value="summary" className="grid gap-y-6 font-mono">
						<SummarySection participants={participants} items={items} />
					</TabsContent>
				</Tabs>
			</form>
		</main>
	);
}

export default App;
