import { useStore } from "@tanstack/react-form";
import {
	AlertCircleIcon,
	Banknote,
	LayoutList,
	Percent,
	Plus,
	Trash,
} from "lucide-react";
import { ParticipantsSection } from "@/components/participants-section";
import { SummarySection } from "@/components/summary-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
	FieldError,
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

	// const values = useStore(form.store, (state) => state.values);
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

	function handleItemTypeChange(index: number) {
		form.setFieldValue(
			`items[${index}].distributions`,
			items[index].distributions.map((distribution) => ({
				...distribution,
				amount: 0,
			})),
		);
	}

	function handleRemoveItem(index: number) {
		form.removeFieldValue("items", index);
	}

	return (
		<main className="max-w-3xl mx-auto p-6 flex flex-col gap-y-[var(--gutter-block)] [--gutter-block:theme(spacing.8)]">
			{/* <pre>{JSON.stringify(values, null, 2)}</pre>
			<pre>{JSON.stringify(errors, null, 2)}</pre> */}
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
									<form.AppField name="items" mode="array">
										{(field) =>
											field.state.value.map((item, iIndex) => {
												const fieldErrors = errors.at(0)?.[`items[${iIndex}]`];

												return (
													<FieldGroup
														key={item.id}
														className="border p-6 rounded-lg border-dashed grid sm:grid-cols-3 [&>div:has(div[role=radiogroup])]:col-span-full [&>fieldset]:col-span-full gap-x-4 relative"
													>
														<Button
															type="button"
															size="icon-sm"
															variant="ghost"
															className="absolute top-1.5 right-1.5"
															onClick={() => handleRemoveItem(iIndex)}
														>
															<Trash />
														</Button>
														<form.AppField name={`items[${iIndex}].amount`}>
															{(field) => (
																<field.Input
																	label="Amount"
																	type="number"
																	placeholder="Enter amount"
																/>
															)}
														</form.AppField>
														<form.AppField name={`items[${iIndex}].name`}>
															{(field) => (
																<field.Input
																	label="Name"
																	type="text"
																	placeholder="Enter item name"
																/>
															)}
														</form.AppField>
														<form.AppField name={`items[${iIndex}].paidBy`}>
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
														<form.AppField
															name={`items[${iIndex}].type`}
															listeners={{
																onChange: () => handleItemTypeChange(iIndex),
															}}
														>
															{(field) => (
																<field.Radio
																	label="Type"
																	options={itemTypeSchema.options.map(
																		(option) => ({
																			label: option,
																			value: option,
																		}),
																	)}
																/>
															)}
														</form.AppField>
														<form.Subscribe
															selector={(state) =>
																state.values.items[iIndex].type
															}
														>
															{(type) =>
																type !== "evenly" ? (
																	<FieldSet>
																		<FieldLegend className="flex items-center gap-x-2">
																			Distribution
																			<form.Subscribe
																				selector={(state) =>
																					state.values.items[iIndex].type
																				}
																			>
																				{type === "absolute" ? (
																					<Banknote className="size-5" />
																				) : (
																					<Percent />
																				)}
																			</form.Subscribe>
																		</FieldLegend>
																		<FieldGroup className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4">
																			{item.distributions.map(
																				(distribution, dIndex) => (
																					<form.AppField
																						name={`items[${iIndex}].distributions[${dIndex}].amount`}
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
														{fieldErrors ? (
															<Alert
																variant="destructive"
																className="col-span-full"
															>
																<AlertCircleIcon />
																<AlertTitle>Error!</AlertTitle>
																<AlertDescription>
																	<FieldError errors={fieldErrors} />
																</AlertDescription>
															</Alert>
														) : null}
													</FieldGroup>
												);
											})
										}
									</form.AppField>
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
					<TabsContent value="summary" className="grid gap-y-6 font-mono">
						<SummarySection participants={participants} items={items} />
					</TabsContent>
				</Tabs>
			</form>
		</main>
	);
}

export default App;
