import { Edit, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { type Participant, participantNameSchema } from "@/lib/schemas";

type Props = {
	participant: Participant;
	editParticipant: (name: Participant["name"]) => void;
	isNameUnique: (name: Participant["name"]) => boolean;
	removeParticipant: () => void;
};

export function ParticipantBadge({
	participant,
	editParticipant,
	isNameUnique,
	removeParticipant,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const [name, setName] = useState(participant.name);
	const [error, setError] = useState<string | null>(null);

	function handleEdit() {
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

		editParticipant(parsedName);

		setIsOpen(false);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key !== "Enter") return;

		e.preventDefault();
		handleEdit();
	}

	return (
		<Badge className="text-sm gap-x-2">
			{participant.name}
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger
					aria-label="Participant Actions"
					title="Participant Actions"
				>
					<Ellipsis />
				</PopoverTrigger>
				<PopoverContent>
					<FieldSet>
						<FieldGroup>
							<Field data-invalid={error ? true : false}>
								<ButtonGroup>
									<InputGroup>
										<InputGroupInput
											type="text"
											placeholder="Enter Participant Name"
											onKeyDown={handleKeyDown}
											value={name}
											onChange={(e) => setName(e.target.value)}
											aria-invalid={error ? true : false}
											aria-describedby={
												error ? "edit-participant-name-error" : undefined
											}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												aria-label="Edit Participant"
												title="Edit Participant"
												size="icon-xs"
												onClick={handleEdit}
											>
												<Edit />
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									<Button
										type="button"
										variant="outline"
										size="icon"
										aria-label="Delete Participant"
										title="Delete Participant"
										onClick={removeParticipant}
									>
										<Trash />
									</Button>
								</ButtonGroup>
								<FieldError id="edit-participant-name-error">
									{error}
								</FieldError>
							</Field>
						</FieldGroup>
					</FieldSet>
				</PopoverContent>
			</Popover>
		</Badge>
	);
}
