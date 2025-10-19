import { useStore } from "@tanstack/react-form";
import { ItemsBreakdownSection } from "@/components/items-breakdown-section";
import { ItemsSection } from "@/components/items-section";
import { ParticipantsSection } from "@/components/participants-section";
import { SummarySection } from "@/components/summary-section";
import { FieldSeparator } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import {
	createEmptyItem,
	createEmptyParticipant,
	type Item,
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

	function handleFindParticipantName(participantId: Participant["id"]) {
		return participants.find((participant) => participant.id === participantId)
			?.name;
	}

	/**
	 * items
	 */
	const items = useStore(form.store, (state) => state.values.items);

	function handleAddItem(payload: Partial<Item>) {
		form.pushFieldValue("items", createEmptyItem(payload));
	}

	return (
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
						<ParticipantsSection
							participants={participants}
							addParticipant={handleAddParticipant}
							removeParticipant={handleRemoveParticipant}
							updateParticipant={handleUpdateParticipant}
							removeAllParticipants={handleRemoveAllParticipants}
						/>
						<FieldSeparator />
						<ItemsSection participants={participants} addItem={handleAddItem} />
						<FieldSeparator />
						<ItemsBreakdownSection
							items={items}
							findParticipantName={handleFindParticipantName}
						/>
					</TabsContent>
					<TabsContent
						value="summary"
						className="grid gap-y-[var(--gutter-block)] font-mono"
					>
						<SummarySection participants={participants} items={items} />
					</TabsContent>
				</Tabs>
			</form>
		</main>
	);
}

export default App;
