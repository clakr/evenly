import { Plus } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
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
	isNameUnique: (name: Participant["name"]) => boolean;
	addDistribution: (name: Participant["name"]) => void;
};

export function AddDistributionPopover({
	isNameUnique,
	addDistribution,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

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

		addDistribution(parsedName);

		setIsOpen(false);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key !== "Enter") return;

		e.preventDefault();
		handleAdd();
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					size="icon"
					aria-label="Add Participant"
					title="Add Participant"
					variant="outline"
				>
					<Plus />
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<Field data-invalid={error ? true : false}>
					<InputGroup>
						<InputGroupInput
							type="text"
							placeholder="Enter Participant Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							aria-invalid={error ? true : false}
							aria-describedby={
								error ? "add-distribution-participant-name-error" : undefined
							}
							onKeyDown={handleKeyDown}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								aria-label="Add Participant"
								title="Add Participant"
								onClick={handleAdd}
								size="icon-xs"
							>
								<Plus />
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
					<FieldError id="add-distribution-participant-name-error">
						{error}
					</FieldError>
				</Field>
			</PopoverContent>
		</Popover>
	);
}
