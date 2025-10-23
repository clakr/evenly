import { useStore } from "@tanstack/react-form";
import { Plus, Trash, User } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { ParticipantBadge } from "@/components/participant-badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { formOpts, withForm } from "@/lib/form";
import {
	createEmptyParticipant,
	type Participant,
	participantNameSchema,
} from "@/lib/schemas";

export const ParticipantsForm = withForm({
	...formOpts,
	render: function Render({ form }) {
		const participants = useStore(
			form.store,
			(state) => state.values.participants,
		);

		const isEmpty = participants.length === 0;

		const [name, setName] = useState("");
		const [error, setError] = useState<string | null>(null);

		function isNameUnique(name: Participant["name"], index?: number) {
			return index !== undefined
				? !participants.slice(0, index).some((p) => p.name === name)
				: !participants.some((p) => p.name === name);
		}

		function handleAdd() {
			setError(null);

			const {
				success,
				error,
				data: parsedName,
			} = participantNameSchema.safeParse(name);
			if (!success) {
				setError(z.treeifyError(error).errors.at(0) || null);
				return;
			}

			const isUnique = isNameUnique(parsedName);
			if (!isUnique) {
				setError("Participant name must be unique");
				return;
			}

			form.pushFieldValue(
				"participants",
				createEmptyParticipant({
					name: parsedName,
				}),
			);

			setName("");
		}

		function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
			if (e.key !== "Enter") return;

			e.preventDefault();
			handleAdd();
		}

		function handleRemoveAll() {
			form.setFieldValue("participants", []);
		}

		function handleEdit(index: number, name: Participant["name"]) {
			const participant = participants[index];

			form.replaceFieldValue("participants", index, {
				...participant,
				name,
			});
		}

		function handleRemove(index: number) {
			form.removeFieldValue("participants", index);
		}

		return (
			<section className="grid gap-y-[calc(var(--gutter-block)/2)]">
				<h2 className="font-medium">Participants</h2>
				{isEmpty ? (
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
					<div className="flex flex-wrap gap-1.5">
						{participants.map((participant, index) => (
							<ParticipantBadge
								key={participant.id}
								participant={participant}
								editParticipant={(name) => handleEdit(index, name)}
								isNameUnique={(name) => isNameUnique(name, index)}
								removeParticipant={() => handleRemove(index)}
							/>
						))}
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleRemoveAll}
						>
							<Trash />
							Remove All
						</Button>
					</div>
				)}
				<FieldSet>
					<FieldGroup>
						<Field data-invalid={error ? true : false}>
							<InputGroup>
								<InputGroupAddon>
									<User />
								</InputGroupAddon>
								<InputGroupInput
									type="text"
									placeholder="Enter Participant Name"
									onKeyDown={handleKeyDown}
									value={name}
									onChange={(e) => setName(e.target.value)}
									aria-invalid={error ? true : false}
									aria-describedby={
										error ? "participant-name-error" : undefined
									}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										aria-label="Add Participant"
										title="Add Participant"
										size="icon-xs"
										onClick={handleAdd}
									>
										<Plus />
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							<FieldError id="participant-name-error">{error}</FieldError>
						</Field>
					</FieldGroup>
				</FieldSet>
			</section>
		);
	},
});
