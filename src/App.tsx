import { useStore } from "@tanstack/react-form";
import { AddParticipantsSection } from "./components/add-participants-section";
import { Separator } from "./components/ui/separator";
import { useAppForm } from "./lib/form";
import {
	createEmptyParticipant,
	type Participant,
	type Schema,
	schema,
} from "./lib/schemas";

function App() {
	const form = useAppForm({
		defaultValues: {
			participants: [],
		} as Schema,
		validators: {
			onChange: schema,
		},
		onSubmit: ({ value }) => {
			console.log(value);
		},
	});

	const participants = useStore(
		form.store,
		(state) => state.values.participants,
	);

	function handleAddParticipant(name: Participant["name"]) {
		form.pushFieldValue(
			"participants",
			createEmptyParticipant({
				name,
			}),
		);
	}

	function handleRemoveParticipant(index: number) {
		form.removeFieldValue("participants", index);
	}

	function handleUpdateParticipant(index: number, name: Participant["name"]) {
		const participant = participants[index];

		form.replaceFieldValue("participants", index, {
			...participant,
			name,
		});
	}

	function handleRemoveAllParticipants() {
		form.setFieldValue("participants", []);
	}

	return (
		<main className="max-w-5xl mx-auto p-6 flex flex-col gap-y-[var(--gutter-block)] [--gutter-block:theme(spacing.8)]">
			<h1 className="text-5xl font-bold">Evenly</h1>
			<form
				className="grid gap-y-[var(--gutter-block)]"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<AddParticipantsSection
					participants={participants}
					addParticipant={handleAddParticipant}
					removeParticipant={handleRemoveParticipant}
					updateParticipant={handleUpdateParticipant}
					removeAllParticipants={handleRemoveAllParticipants}
				/>
				<Separator />
				<section>items</section>
				<Separator />
				<section>summary</section>
			</form>
		</main>
	);
}

export default App;
