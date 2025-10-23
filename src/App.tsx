import { useStore } from "@tanstack/react-form";
import { ItemsBreakdownSection } from "@/components/items-breakdown-section";
import { ItemsSection } from "@/components/items-section";
import { ParticipantsForm } from "@/components/participants-form";
import { SummaryTabContent } from "@/components/summary-tab-content";
import { FieldSeparator } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import {
	createEmptyItem,
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
						<ParticipantsForm form={form} />
						<FieldSeparator />
						<ItemsSection participants={participants} addItem={handleAddItem} />
						{items.length > 0 ? (
							<>
								<FieldSeparator />
								<ItemsBreakdownSection
									items={items}
									findParticipantName={handleFindParticipantName}
								/>
							</>
						) : null}
					</TabsContent>
					<SummaryTabContent
						items={items}
						findParticipantName={handleFindParticipantName}
					/>
				</Tabs>
			</form>
		</main>
	);
}

export default App;
