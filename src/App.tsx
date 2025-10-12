import { useStore } from "@tanstack/react-form";
import { Banknote, LayoutList, Percent, Plus } from "lucide-react";
import { ParticipantsSection } from "@/components/participants-section";
import { SummarySection } from "@/components/summary-section";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	FieldGroup,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/lib/form";
import {
	createEmptyItem,
	createEmptyParticipant,
	itemTypeSchema,
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

	const values = useStore(form.store, (state) => state.values);
	const errors = useStore(form.store, (state) => state.errors);

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

	function findParticipantName(participantId: Participant["id"]) {
		return participants.find((participant) => participant.id === participantId)
			?.name;
	}

	/**
	 * items
	 */
	const items = useStore(form.store, (state) => state.values.items);

	function handleAddItem() {
		form.pushFieldValue(
			"items",
			createEmptyItem({
				distributions: participants.map((participant) => ({
					participantId: participant.id,
					amount: 0,
				})),
			}),
		);
	}

	return (
		<main className="max-w-3xl mx-auto p-6 flex flex-col gap-y-[var(--gutter-block)] [--gutter-block:theme(spacing.8)]">
			{/* <pre>{JSON.stringify(values, null, 2)}</pre>
			<pre>{JSON.stringify(errors, null, 2)}</pre> */}
			<h1 className="text-5xl font-bold">Evenly</h1>
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
						<FieldSeparator />
						<FieldSet
							className="grid gap-y-4"
							disabled={participants.length === 0}
						>
							<FieldLegend>Items</FieldLegend>
							{items.length === 0 ? (
								<Empty className="border border-dashed">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<LayoutList />
										</EmptyMedia>
										<EmptyTitle>No items yet.</EmptyTitle>
										<EmptyDescription>
											Add items to get started.
										</EmptyDescription>
									</EmptyHeader>
									<EmptyContent>
										<Button onClick={handleAddItem}>
											<Plus />
											Add Item
										</Button>
									</EmptyContent>
								</Empty>
							) : (
								<>
									{items.map((item, index) => (
										<FieldGroup
											key={item.id}
											className="border p-6 rounded-lg border-dashed"
										>
											<form.AppField name={`items[${index}].amount`}>
												{(field) => (
													<field.Input
														label="Amount"
														type="number"
														placeholder="Enter amount"
													/>
												)}
											</form.AppField>
											<form.AppField name={`items[${index}].name`}>
												{(field) => (
													<field.Input
														label="Name"
														type="text"
														placeholder="Enter item name"
													/>
												)}
											</form.AppField>
											<form.AppField name={`items[${index}].paidBy`}>
												{(field) => (
													<field.Select
														label="Paid By"
														placeholder="Select paid by"
														options={participants.map((participant) => ({
															label: participant.name,
															value: participant.id,
														}))}
													/>
												)}
											</form.AppField>
											<form.AppField name={`items[${index}].type`}>
												{(field) => (
													<field.Radio
														label="Type"
														options={itemTypeSchema.options.map((option) => ({
															label: option,
															value: option,
														}))}
													/>
												)}
											</form.AppField>
											<form.Subscribe
												selector={(state) => state.values.items[index].type}
											>
												{(type) =>
													type !== "evenly" ? (
														<FieldSet>
															<FieldLegend className="flex items-center gap-x-2">
																Distribution
																<form.Subscribe
																	selector={(state) =>
																		state.values.items[index].type
																	}
																>
																	{type === "absolute" ? (
																		<Banknote className="size-5" />
																	) : (
																		<Percent />
																	)}
																</form.Subscribe>
															</FieldLegend>
															<FieldGroup className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
																{item.distributions.map(
																	(distribution, dIndex) => (
																		<form.AppField
																			name={`items[${index}].distributions[${dIndex}].amount`}
																		>
																			{(field) => (
																				<field.Input
																					label={findParticipantName(
																						distribution.participantId,
																					)}
																					type="number"
																					placeholder="Enter amount"
																				/>
																			)}
																		</form.AppField>
																	),
																)}
															</FieldGroup>
														</FieldSet>
													) : null
												}
											</form.Subscribe>
										</FieldGroup>
									))}
									<Button
										type="button"
										variant="secondary"
										onClick={handleAddItem}
									>
										<Plus />
										Add Item
									</Button>
								</>
							)}
						</FieldSet>
					</TabsContent>
					<TabsContent value="summary">
						<SummarySection participants={participants} items={items} />
					</TabsContent>
				</Tabs>
			</form>
		</main>
	);
}

export default App;
