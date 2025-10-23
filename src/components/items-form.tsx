import { useStore } from "@tanstack/react-form";
import { Banknote, Percent, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formOpts, withForm } from "@/lib/form";
import {
	createEmptyItem,
	type Distribution,
	type Item,
	type ItemType,
	itemSchema,
	itemTypeSchema,
	type Participant,
} from "@/lib/schemas";

export const ItemsForm = withForm({
	...formOpts,
	render: function Render({ form }) {
		const participants = useStore(
			form.store,
			(state) => state.values.participants,
		);

		const isParticipantsEmpty = participants.length === 0;

		const inputRef = useRef<HTMLInputElement>(null);

		const [item, setItem] = useState<Item>(createEmptyItem());
		const [error, setError] = useState<z.ZodFlattenedError<Item> | null>(null);

		function handleFindParticipantName(participantId: Participant["id"]) {
			return participants.find(
				(participant) => participant.id === participantId,
			)?.name;
		}

		function handleDistributionAmountChange({
			participantId,
			amount,
		}: Distribution) {
			setItem((prev) => ({
				...prev,
				distributions: prev.distributions.map((d) =>
					d.participantId === participantId ? { ...d, amount } : d,
				),
			}));
		}

		function handleAdd() {
			setError(null);

			const { success, error, data } = itemSchema.safeParse(item);
			if (!success) {
				setError(z.flattenError(error));
				return;
			}

			form.pushFieldValue("items", data);

			inputRef.current?.focus();

			setItem(
				createEmptyItem({
					distributions: participants.map((participant) => ({
						participantId: participant.id,
						amount: 0,
					})),
				}),
			);
		}

		function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
			if (e.key !== "Enter") return;

			handleAdd();
		}

		// syncs distribution with participants
		useEffect(() => {
			setItem((prev) => ({
				...prev,
				distributions: participants.map((participant) => ({
					participantId: participant.id,
					amount: 0,
				})),
			}));
		}, [participants]);

		// syncs distributions amounts depending on the item type
		useEffect(() => {
			if (item.type === "evenly") {
				setItem((prev) => ({
					...prev,
					distributions: prev.distributions.map((distribution) => ({
						...distribution,
						amount: item.amount / prev.distributions.length,
					})),
				}));

				return;
			}

			setItem((prev) => ({
				...prev,
				distributions: prev.distributions.map((distribution) => ({
					...distribution,
					amount: 0,
				})),
			}));
		}, [item.type, item.amount]);

		return (
			<section className="grid gap-y-[calc(var(--gutter-block)/2)]">
				<h2 className="font-medium">Items</h2>
				{isParticipantsEmpty ? (
					<Empty className="border border-dashed">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<User />
							</EmptyMedia>
							<EmptyTitle>No participants yet.</EmptyTitle>
							<EmptyDescription>
								Add participants to get started.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<FieldSet className="border border-dashed p-4 rounded-lg">
						<FieldGroup className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
							<Field data-invalid={error?.fieldErrors.amount ? true : false}>
								<FieldLabel htmlFor="amount">Amount</FieldLabel>
								<Input
									type="number"
									id="amount"
									placeholder="Enter Amount"
									value={item.amount}
									onChange={(e) =>
										setItem({ ...item, amount: e.target.valueAsNumber })
									}
									min={0}
									onKeyDown={handleKeyDown}
									aria-invalid={error?.fieldErrors.amount ? true : false}
									aria-describedby={
										error?.fieldErrors.amount ? "amount-error" : undefined
									}
									ref={inputRef}
								/>
								<FieldDescription>insert description here</FieldDescription>
								<FieldError
									id="amount-error"
									errors={error?.fieldErrors.amount?.map((error) => ({
										message: error,
									}))}
								/>
							</Field>
							<Field data-invalid={error?.fieldErrors.name ? true : false}>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									type="text"
									id="name"
									placeholder="Enter Name"
									value={item.name}
									onChange={(e) => setItem({ ...item, name: e.target.value })}
									aria-invalid={error?.fieldErrors.name ? true : false}
									aria-describedby={
										error?.fieldErrors.name ? "name-error" : undefined
									}
									onKeyDown={handleKeyDown}
								/>
								<FieldDescription>insert description here</FieldDescription>
								<FieldError
									id="name-error"
									errors={error?.fieldErrors.name?.map((error) => ({
										message: error,
									}))}
								/>
							</Field>
							<Field
								data-invalid={error?.fieldErrors.paidBy ? true : false}
								className="col-span-full"
							>
								<FieldLabel htmlFor="paidBy">Paid By</FieldLabel>
								<Select
									value={item.paidBy}
									onValueChange={(value) => setItem({ ...item, paidBy: value })}
								>
									<SelectTrigger
										id="paidBy"
										aria-invalid={error?.fieldErrors.paidBy ? true : false}
										aria-describedby={
											error?.fieldErrors.paidBy ? "paidBy-error" : undefined
										}
									>
										<SelectValue placeholder="Select a participant" />
									</SelectTrigger>
									<SelectContent>
										{participants.map((participant) => (
											<SelectItem key={participant.id} value={participant.id}>
												{participant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldDescription>insert description here</FieldDescription>
								<FieldError
									id="paidBy-error"
									errors={error?.fieldErrors.paidBy?.map((error) => ({
										message: error,
									}))}
								/>
							</Field>
							<FieldSet
								data-invalid={error?.fieldErrors.type ? true : false}
								className="col-span-full"
							>
								<FieldLabel>Type</FieldLabel>
								<FieldDescription>insert description here</FieldDescription>
								<RadioGroup
									value={item.type}
									onValueChange={(value: ItemType) =>
										setItem({ ...item, type: value })
									}
									aria-invalid={error?.fieldErrors.type ? true : false}
									aria-describedby={
										error?.fieldErrors.type ? "type-error" : undefined
									}
								>
									{itemTypeSchema.options.map((option) => (
										<Field orientation="horizontal" key={option}>
											<RadioGroupItem value={option} id={option} />
											<FieldLabel
												htmlFor={option}
												className="font-normal capitalize"
											>
												{option}
											</FieldLabel>
										</Field>
									))}
								</RadioGroup>
								<FieldError
									id="type-error"
									errors={error?.fieldErrors.type?.map((error) => ({
										message: error,
									}))}
								/>
							</FieldSet>
							<FieldSeparator className="col-span-full" />
							<FieldSet className="col-span-full">
								<FieldLabel>Distribution</FieldLabel>
								<FieldGroup className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
									{item.distributions.map((distribution, index) => (
										<Field
											key={distribution.participantId}
											data-invalid={
												error?.fieldErrors.distributions?.[index] ? true : false
											}
										>
											<FieldLabel htmlFor={distribution.participantId}>
												{handleFindParticipantName(distribution.participantId)}
											</FieldLabel>
											<InputGroup>
												{item.type !== "percentage" ? (
													<InputGroupAddon>
														<Banknote />
													</InputGroupAddon>
												) : null}
												<InputGroupInput
													type="number"
													id={distribution.participantId}
													placeholder="Enter amount"
													value={distribution.amount}
													onChange={(event) =>
														handleDistributionAmountChange({
															participantId: distribution.participantId,
															amount: event.target.valueAsNumber,
														})
													}
													readOnly={item.type === "evenly"}
													min={0}
													onKeyDown={handleKeyDown}
													aria-invalid={
														error?.fieldErrors.distributions?.[index]
															? true
															: false
													}
													aria-describedby={
														error?.fieldErrors.distributions?.[index]
															? "distributions-error"
															: undefined
													}
												/>

												{item.type === "percentage" ? (
													<InputGroupAddon align="inline-end">
														<Percent />
													</InputGroupAddon>
												) : null}
											</InputGroup>
											<FieldError id="distributions-error">
												{error?.fieldErrors.distributions?.[index]}
											</FieldError>
										</Field>
									))}
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</FieldSet>
				)}
			</section>
		);
	},
});
