import { AlertCircle, Plus, Trash2, User } from "lucide-react";
import { useId, useRef, useState } from "react";
import * as z from "zod";
import { ParticipantBadge } from "@/components/participant-badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	type Participant,
	participantNameSchema,
	type Schema,
} from "@/lib/schemas";

type Props = {
	participants: Schema["participants"];
	addParticipant: (name: Participant["name"]) => void;
	removeParticipant: (index: number) => void;
	updateParticipant: (index: number, name: Participant["name"]) => void;
	removeAllParticipants: () => void;
};

export function ParticipantsSection({
	participants,
	addParticipant,
	removeParticipant,
	updateParticipant,
	removeAllParticipants,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	const [name, setName] = useState("");

	const [error, setError] = useState<string | null>(null);
	const errorId = useId();

	const isEmpty = participants.length === 0;

	function handleAddParticipant() {
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

		if (participants.some((p) => p.name === parsedName)) {
			setError("Participant name must be unique");
			return;
		}

		addParticipant(parsedName);

		setName("");
		inputRef.current?.focus();
	}

	function isNameUnique(name: Participant["name"]) {
		return !participants.some((p) => p.name === name);
	}

	return (
		<section className="grid gap-y-4">
			<h2 className="font-medium">Participants</h2>
			<div className="grid gap-y-4">
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
								removeParticipant={() => removeParticipant(index)}
								updateParticipant={(name) => updateParticipant(index, name)}
								isNameUnique={(name) => isNameUnique(name)}
							/>
						))}
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={removeAllParticipants}
						>
							<Trash2 />
							Remove All
						</Button>
					</div>
				)}

				<div className="flex flex-col gap-y-2">
					<InputGroup>
						<InputGroupInput
							ref={inputRef}
							type="text"
							placeholder="Enter participant name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAddParticipant();
								}
							}}
							aria-invalid={error ? true : false}
							aria-describedby={error ? errorId : undefined}
						/>
						<InputGroupAddon>
							<User />
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								type="button"
								size="icon-xs"
								onClick={handleAddParticipant}
							>
								<Plus />
								<span className="sr-only">add participant</span>
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>

					{error ? (
						<Alert id={errorId} variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					) : null}
				</div>
			</div>
		</section>
	);
}
