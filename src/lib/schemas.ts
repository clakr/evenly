import * as z from "zod";

export const participantSchema = z.object({
	id: z.uuid(),
	name: z.string(),
});

export const schema = z.object({
	participants: z.array(participantSchema),
});

export type Participant = z.infer<typeof participantSchema>;
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
