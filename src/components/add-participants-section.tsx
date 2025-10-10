import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Participant, Schema } from "@/lib/schemas";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Input } from "./ui/input";

type Props = {
	participants: Schema["participants"];
	addParticipant: (name: Participant["name"]) => void;
	removeParticipant: (index: number) => void;
};

export function AddParticipantsSection({
	participants,
	addParticipant,
	removeParticipant,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState("");

	function handleAddParticipant() {
		addParticipant(name);

		setName("");
		inputRef.current?.focus();
	}

	return (
		<section className="grid gap-y-4">
			<h2 className="font-medium">Participants</h2>
			<div className="grid gap-y-4">
				<div className="flex flex-wrap gap-1">
					{participants.map((participant, index) => (
						<Badge key={participant.id}>
							{participant.name}
							<button
								type="button"
								className="cursor-pointer"
								onClick={() => removeParticipant(index)}
							>
								<X />
								<span className="sr-only">remove participant</span>
							</button>
						</Badge>
					))}
				</div>
				<ButtonGroup className="w-full">
					<Input
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
					<Button
						type="button"
						variant="outline"
						onClick={handleAddParticipant}
					>
						<Plus />
						<span className="sr-only">add participant</span>
					</Button>
				</ButtonGroup>
			</div>
		</section>
	);
}
