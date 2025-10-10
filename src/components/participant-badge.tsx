import { Ellipsis, Trash } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Participant } from "@/lib/schemas";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Input } from "./ui/input";

type Props = {
	participant: Participant;
	removeParticipant: () => void;
	updateParticipant: (name: Participant["name"]) => void;
};

export function ParticipantBadge({
	participant,
	removeParticipant,
	updateParticipant,
}: Props) {
	return (
		<Badge className="text-sm gap-x-2 h-8 rounded-md gap-1.5">
			{participant.name}
			<Popover>
				<PopoverTrigger className="cursor-pointer hover:opacity-75 transition-opacity">
					<Ellipsis />
					<span className="sr-only">participant actions</span>
				</PopoverTrigger>
				<PopoverContent className="p-[var(--padding)] [--padding:theme(spacing.2)]">
					<ButtonGroup className="w-full [&>*:not(:first-child)]:rounded-l-[calc(var(--radius)-var(--padding))] [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-[calc(var(--radius)-var(--padding))] ">
						<Input
							value={participant.name}
							onChange={(event) => updateParticipant(event.target.value)}
						/>
						<Button variant="outline" onClick={removeParticipant}>
							<Trash />
							<span className="sr-only">remove participant</span>
						</Button>
					</ButtonGroup>
				</PopoverContent>
			</Popover>
		</Badge>
	);
}
