import { AlertCircle, Edit, Ellipsis, Trash } from "lucide-react";
import { useId, useState } from "react";
import * as z from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
	removeParticipant: () => void;
	updateParticipant: (name: Participant["name"]) => void;
	isNameUnique: (name: Participant["name"]) => boolean;
};

export function ParticipantBadge({
	participant,
	removeParticipant,
	updateParticipant,
	isNameUnique,
}: Props) {
	const [name, setName] = useState(participant.name);

	const [error, setError] = useState<string | null>(null);
	const errorId = useId();

	function handleUpdateParticipant() {
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

		updateParticipant(parsedName);
	}

	return (
		<Badge className="text-sm gap-x-2 h-8 rounded-md gap-1.5">
			{participant.name}
			<Popover>
				<PopoverTrigger className="cursor-pointer hover:opacity-75 transition-opacity">
					<Ellipsis />
					<span className="sr-only">participant actions</span>
				</PopoverTrigger>
				<PopoverContent className="p-[var(--padding)] [--padding:theme(spacing.2)] flex flex-col gap-y-2 pb-3">
					<ButtonGroup className="w-full [&>*:not(:first-child)]:rounded-l-[calc(var(--radius)-var(--padding))] [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-[calc(var(--radius)-var(--padding))] ">
						<InputGroup>
							<InputGroupInput
								type="text"
								placeholder="Enter participant name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleUpdateParticipant();
									}
								}}
								aria-invalid={error ? true : false}
								aria-describedby={error ? errorId : undefined}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupButton
									type="button"
									size="icon-xs"
									onClick={handleUpdateParticipant}
								>
									<Edit />
									<span className="sr-only">edit participant</span>
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>

						<Button variant="outline" onClick={removeParticipant}>
							<Trash />
							<span className="sr-only">remove participant</span>
						</Button>
					</ButtonGroup>
					{error ? (
						<Alert id={errorId} variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					) : null}
				</PopoverContent>
			</Popover>
		</Badge>
	);
}
