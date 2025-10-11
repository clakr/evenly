import * as z from "zod";

export const participantNameSchema = z.string().min(1, "Name is required");
export type ParticipantName = z.infer<typeof participantNameSchema>;

export const participantSchema = z.object({
	id: z.uuid(),
	name: participantNameSchema,
});
export type Participant = z.infer<typeof participantSchema>;

export const itemTypeSchema = z.enum(["evenly", "absolute", "percentage"]);
export type ItemType = z.infer<typeof itemTypeSchema>;

export const itemSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1, "Name is required"),
	amount: z.number().min(1, "Amount is required"),
	paidBy: participantSchema.shape.id,
	type: itemTypeSchema,
	distributions: z.array(
		z.object({
			participantId: participantSchema.shape.id,
			amount: z.number().min(1, "Amount is required"),
		}),
	),
});

export type Item = z.infer<typeof itemSchema>;
export type ItemInput = z.input<typeof itemSchema>;

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
	items: z.array(itemSchema),
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

export function createEmptyItem(payload: Partial<ItemInput> = {}): ItemInput {
	return {
		id: crypto.randomUUID(),
		name: "",
		amount: 0,
		paidBy: "",
		type: "evenly",
		distributions: [],
		...payload,
	};
}
