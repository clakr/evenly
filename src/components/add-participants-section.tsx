import { Plus, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import type { Participant, Schema } from "@/lib/schemas";
import { ParticipantBadge } from "./participant-badge";
import { Button } from "./ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./ui/input-group";

type Props = {
	participants: Schema["participants"];
	addParticipant: (name: Participant["name"]) => void;
	removeParticipant: (index: number) => void;
	updateParticipant: (index: number, name: Participant["name"]) => void;
	removeAllParticipants: () => void;
};

export function AddParticipantsSection({
	participants,
	addParticipant,
	removeParticipant,
	updateParticipant,
	removeAllParticipants,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState("");

	const isEmpty = participants.length === 0;

	function handleAddParticipant() {
		addParticipant(name);

		setName("");
		inputRef.current?.focus();
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
			</div>
		</section>
	);
}
