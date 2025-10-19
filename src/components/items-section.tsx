import { AlertCircleIcon, Banknote, Percent, Plus } from "lucide-react";
import { useRef, useState } from "react";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	createEmptyItem,
	type ItemInput,
	type ItemType,
	itemSchema,
	itemTypeSchema,
	type Participant,
} from "@/lib/schemas";

type Props = {
	participants: Participant[];
	addItem: (payload: Partial<ItemInput>) => void;
};

export function ItemsSection({ participants, addItem }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	const [itemForm, setItemForm] = useState<ItemInput>(createEmptyItem());
	const [formErrors, setFormErrors] =
		useState<z.ZodFlattenedError<ItemInput> | null>(null);

	function handleAddItem() {
		setFormErrors(null);

		const { success, error, data } = itemSchema.safeParse(itemForm);
		if (!success) {
			setFormErrors(z.flattenError(error));
			return;
		}

		addItem(data);

		setItemForm(createEmptyItem());
		inputRef.current?.focus();
	}

	function handleAmountOnChange(
		e: React.ChangeEvent<HTMLInputElement>,
		participantId: Participant["id"],
	) {
		setItemForm((prev) => {
			const distributionsMap = new Map(
				prev.distributions.map((distribution) => [
					distribution.participantId,
					distribution,
				]),
			);

			distributionsMap.set(participantId, {
				participantId,
				amount: e.target.valueAsNumber,
			});

			const distributions = Array.from(distributionsMap.values());

			return {
				...prev,
				distributions,
			};
		});
	}

	return (
		<section className="grid gap-y-4">
			<h2 className="font-medium">Items</h2>
			<FieldGroup className="border border-dashed p-6 rounded-lg grid sm:grid-cols-3 gap-x-4">
				<Field data-invalid={formErrors?.fieldErrors.amount}>
					<FieldLabel htmlFor="amount">Amount</FieldLabel>
					<Input
						ref={inputRef}
						type="number"
						id="amount"
						placeholder="Enter amount"
						value={itemForm.amount}
						onChange={(e) =>
							setItemForm((prev) => ({
								...prev,
								amount: e.target.valueAsNumber,
							}))
						}
						aria-invalid={formErrors?.fieldErrors.amount ? true : false}
						aria-describedby={
							formErrors?.fieldErrors.amount ? "amount-error" : undefined
						}
					/>
					{formErrors?.fieldErrors.amount ? (
						<FieldError
							errors={formErrors.fieldErrors.amount.map((error) => ({
								message: error,
							}))}
						/>
					) : null}
				</Field>
				<Field data-invalid={formErrors?.fieldErrors.name}>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						type="text"
						id="name"
						placeholder="Enter name"
						value={itemForm.name}
						onChange={(e) =>
							setItemForm((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
						aria-invalid={formErrors?.fieldErrors.name ? true : false}
						aria-describedby={
							formErrors?.fieldErrors.name ? "name-error" : undefined
						}
					/>
					{formErrors?.fieldErrors.name ? (
						<FieldError
							errors={formErrors.fieldErrors.name.map((error) => ({
								message: error,
							}))}
						/>
					) : null}
				</Field>
				<Field data-invalid={formErrors?.fieldErrors.paidBy}>
					<FieldLabel htmlFor="paidBy">Paid By</FieldLabel>
					<Select
						value={itemForm.paidBy}
						onValueChange={(value) =>
							setItemForm((prev) => ({
								...prev,
								paidBy: value,
							}))
						}
					>
						<SelectTrigger
							id="paidBy"
							aria-invalid={formErrors?.fieldErrors.paidBy ? true : false}
							aria-describedby={
								formErrors?.fieldErrors.paidBy ? "paidBy-error" : undefined
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
					{formErrors?.fieldErrors.paidBy ? (
						<FieldError
							errors={formErrors.fieldErrors.paidBy.map((error) => ({
								message: error,
							}))}
						/>
					) : null}
				</Field>
				<Field
					data-invalid={formErrors?.fieldErrors.type}
					className="col-span-full"
				>
					<FieldLabel>Type</FieldLabel>
					<RadioGroup
						defaultValue={itemTypeSchema.options[0]}
						value={itemForm.type}
						onValueChange={(value: ItemType) =>
							setItemForm((prev) => ({
								...prev,
								distributions: [],
								type: value,
							}))
						}
						aria-invalid={formErrors?.fieldErrors.type ? true : false}
						aria-describedby={
							formErrors?.fieldErrors.type ? "type-error" : undefined
						}
					>
						{itemTypeSchema.options.map((option) => (
							<div className="flex items-center space-x-2">
								<RadioGroupItem value={option} id={option} />
								<Label htmlFor={option} className="capitalize">
									{option}
								</Label>
							</div>
						))}
					</RadioGroup>
					{formErrors?.fieldErrors.type ? (
						<FieldError
							errors={formErrors.fieldErrors.type.map((error) => ({
								message: error,
							}))}
						/>
					) : null}
				</Field>
				{itemForm.type !== "evenly" ? (
					<FieldSet className="col-span-full">
						<FieldLegend className="flex items-center gap-x-2">
							Distribution
							{itemForm.type === "absolute" ? (
								<Banknote className="size-5" />
							) : (
								<Percent />
							)}
						</FieldLegend>
						<FieldGroup className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4">
							{participants.map((participant, pIndex) => (
								<Field key={participant.id}>
									<FieldLabel htmlFor={`distribution-${participant.id}`}>
										{participant.name}
									</FieldLabel>
									<Input
										type="number"
										id={`distribution-${participant.id}`}
										placeholder="Enter amount"
										value={itemForm.distributions.at(pIndex)?.amount || 0}
										onChange={(e) => handleAmountOnChange(e, participant.id)}
									/>
									<FieldError
										errors={formErrors?.fieldErrors.distributions?.map(
											(error) => ({
												message: error,
											}),
										)}
									/>
								</Field>
							))}
						</FieldGroup>
					</FieldSet>
				) : null}
				{formErrors?.formErrors.length ? (
					<Alert variant="destructive" className="col-span-full">
						<AlertCircleIcon />
						<AlertTitle>Error!</AlertTitle>
						<AlertDescription>
							<FieldError
								errors={formErrors.formErrors.map((error) => ({
									message: error,
								}))}
							/>
						</AlertDescription>
					</Alert>
				) : null}
				<Button
					type="button"
					variant="secondary"
					onClick={handleAddItem}
					className="col-span-full"
				>
					<Plus />
					Add Item
				</Button>
			</FieldGroup>
		</section>
	);
}
