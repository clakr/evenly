import * as z from "zod";

export const participantNameSchema = z.string().min(1, "Name is required");
export type ParticipantName = z.infer<typeof participantNameSchema>;

export const participantSchema = z.object({
	id: z.uuid(),
	name: participantNameSchema,
});
export type Participant = z.infer<typeof participantSchema>;

export const schema = z.object({
	participants: z.array(participantSchema).refine(
		(participants) => {
			const names = participants.map((p) => p.name);
			return names.length === new Set(names).size;
		},
		{
			message: "Participant names must be unique",
		},
	),
});
export type Schema = z.infer<typeof schema>;

export function createEmptyParticipant(
	payload: Partial<Participant>,
): Participant {
	return {
		id: crypto.randomUUID(),
		name: "",
		...payload,
	};
}
