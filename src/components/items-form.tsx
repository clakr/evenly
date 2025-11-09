import { useStore } from "@tanstack/react-form";
import { Banknote, Percent, Plus, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as z from "zod";
import { AddDistributionPopover } from "@/components/add-distribution-popover";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Switch } from "@/components/ui/switch";
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
import type { Option } from "@/lib/types";

export const ItemsForm = withForm({
	...formOpts,
	render: function Render({ form }) {
		const participants = useStore(
			form.store,
			(state) => state.values.participants,
		);
		const items = useStore(form.store, (state) => state.values.items);

		const isParticipantsEmpty = participants.length === 0;

		const inputRef = useRef<HTMLInputElement>(null);

		const [item, setItem] = useState<Item>(createEmptyItem());
		const [error, setError] = useState<z.ZodFlattenedError<Item> | null>(null);

		const [
			isIncludeOverriddenParticipants,
			setIsIncludeOverriddenParticipants,
		] = useState(false);

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
						participantName: participant.name,
						amount: 0,
					})),
				}),
			);

			setError(null);
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
					participantName: participant.name,
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

		const overriddenParticipants = items
			.flatMap((item) => item.distributions)
			.filter(
				(participant) =>
					!participants.some((p) => p.id === participant.participantId),
			);

		function isNameUnique(name: Participant["name"], index?: number) {
			const isParticipantNameUnique =
				index !== undefined
					? !participants.slice(0, index).some((p) => p.name === name)
					: !participants.some((p) => p.name === name);

			const isOverriddenParticipantNameUnique =
				index !== undefined
					? !overriddenParticipants
							.slice(0, index)
							.some((p) => p.participantName === name)
					: !overriddenParticipants.some((p) => p.participantName === name);

			return isParticipantNameUnique && isOverriddenParticipantNameUnique;
		}

		function handleAddDistribution(name: Participant["name"]) {
			setItem((prev) => {
				if (prev.type === "evenly") {
					const distributions = prev.distributions.map((distribution) => ({
						...distribution,
						amount: item.amount / (prev.distributions.length + 1),
					}));

					return {
						...prev,
						distributions: [
							...distributions,
							{
								participantId: crypto.randomUUID(),
								participantName: name,
								amount: item.amount / (prev.distributions.length + 1),
							},
						],
					};
				}

				return {
					...prev,
					distributions: prev.distributions.map((distribution) => ({
						...distribution,
						amount: 0,
					})),
				};
			});
		}

		const participantOptions = useMemo(() => {
			const optionsMap = new Map<Participant["id"], Option>();

			item.distributions.forEach((distribution) => {
				optionsMap.set(distribution.participantId, {
					label: distribution.participantName,
					value: distribution.participantId,
				});
			});

			if (isIncludeOverriddenParticipants) {
				overriddenParticipants.forEach((participant) => {
					optionsMap.set(participant.participantId, {
						label: participant.participantName,
						value: participant.participantId,
					});
				});
			}

			return Array.from(optionsMap.values());
		}, [
			item.distributions,
			isIncludeOverriddenParticipants,
			overriddenParticipants,
		]);

		function handleOnCheckChange(value: boolean) {
			setIsIncludeOverriddenParticipants(value);

			if (value) {
				setItem((prev) => ({
					...prev,
					distributions: [
						...prev.distributions,
						...overriddenParticipants.map((p) => ({
							participantId: p.participantId,
							participantName: p.participantName,
							amount: 0,
						})),
					],
				}));
			} else {
				setItem((prev) => ({
					...prev,
					distributions: prev.distributions.filter(
						(d) =>
							!overriddenParticipants.some(
								(p) => p.participantId === d.participantId,
							),
					),
				}));
			}
		}

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
						<FieldGroup className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
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
								<FieldDescription>
									Enter the total amount for this item
								</FieldDescription>
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
								<FieldDescription>
									Give this item a descriptive name
								</FieldDescription>
								<FieldError
									id="name-error"
									errors={error?.fieldErrors.name?.map((error) => ({
										message: error,
									}))}
								/>
							</Field>
							<FieldSeparator className="col-span-full" />
							<Field
								data-invalid={error?.fieldErrors.paidBy ? true : false}
								className="col-span-full"
							>
								<div className="flex justify-between items-center gap-x-2">
									<FieldLabel htmlFor="paidBy">Paid By</FieldLabel>
									{overriddenParticipants.length > 0 ? (
										<Field orientation="horizontal" className="w-fit">
											<FieldLabel htmlFor="include-overridden-participants">
												Include Overridden Participants
											</FieldLabel>
											<Switch
												id="include-overridden-participants"
												checked={isIncludeOverriddenParticipants}
												onCheckedChange={handleOnCheckChange}
											/>
										</Field>
									) : null}
								</div>

								<ButtonGroup>
									<AddDistributionPopover
										isNameUnique={(name) => isNameUnique(name)}
										addDistribution={(name) => handleAddDistribution(name)}
									/>
									<Select
										value={item.paidBy.id}
										onValueChange={(value) =>
											setItem({
												...item,
												paidBy: {
													id: value,
													name:
														participantOptions.find(
															(participant) => participant.value === value,
														)?.label || "",
												},
											})
										}
									>
										<SelectTrigger
											id="paidBy"
											aria-invalid={error?.fieldErrors.paidBy ? true : false}
											aria-describedby={
												error?.fieldErrors.paidBy ? "paidBy-error" : undefined
											}
											className="grow"
										>
											<SelectValue placeholder="Select a participant" />
										</SelectTrigger>
										<SelectContent>
											{participantOptions.map((participant) => (
												<SelectItem
													key={participant.value}
													value={participant.value}
												>
													{participant.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</ButtonGroup>
								<FieldDescription>
									Select who paid for this item
								</FieldDescription>
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
								<FieldDescription>
									Choose how to distribute this item among participants
								</FieldDescription>
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
							<FieldSet className="col-span-full gap-3">
								<FieldLabel>Distribution</FieldLabel>
								<FieldDescription>
									Set how much each participant should pay for this item
								</FieldDescription>
								<FieldGroup className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
									{item.distributions.map((distribution, index) => (
										<Field
											key={distribution.participantId}
											data-invalid={
												error?.fieldErrors.distributions?.[index] ? true : false
											}
										>
											<FieldLabel htmlFor={distribution.participantId}>
												{distribution.participantName}
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
															participantName: distribution.participantName,
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
							<Button
								variant="secondary"
								className="col-span-full"
								onClick={handleAdd}
							>
								<Plus />
								Add Item
							</Button>
						</FieldGroup>
					</FieldSet>
				)}
			</section>
		);
	},
});
