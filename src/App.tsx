import { useStore } from "@tanstack/react-form";
import { AddParticipantsSection } from "./components/add-participants-section";
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
			participants: [
				{
					id: "123e4567-e89b-12d3-a456-426614174000",
					name: "John Doe",
				},
			],
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

	return (
		<main className="max-w-5xl mx-auto *:outline p-6">
			<form
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
				/>
				<section>items</section>
				<section>summary</section>
			</form>
		</main>
	);
}

export default App;
