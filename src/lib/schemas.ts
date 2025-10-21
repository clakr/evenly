import * as z from "zod";

//////////////////
// PARTICIPANTS //
//////////////////

export const participantNameSchema = z.string().min(1, "Name is required");
export type ParticipantName = z.infer<typeof participantNameSchema>;

export const participantSchema = z.object({
	id: z.uuid(),
	name: participantNameSchema,
});
export type Participant = z.infer<typeof participantSchema>;

///////////////////
// DISTRIBUTIONS //
///////////////////

export const distributionSchema = z.object({
	participantId: participantSchema.shape.id,
	amount: z.number().min(0, "Amount must be equal to or greater than 0"),
});

export type Distribution = z.infer<typeof distributionSchema>;

///////////
// ITEMS //
///////////

export const itemTypeSchema = z.enum(["evenly", "percentage", "absolute"]);
export type ItemType = z.infer<typeof itemTypeSchema>;

export const itemSchema = z
	.object({
		id: z.uuid(),
		name: z.string().min(1, "Name is required"),
		amount: z.number().min(1, "Amount is required"),
		paidBy: participantSchema.shape.id,
		type: itemTypeSchema,
		distributions: z.array(distributionSchema),
	})
	.refine(
		(item) =>
			item.type === "evenly"
				? item.distributions.every((distribution) => distribution.amount === 0)
				: true,
		{
			error:
				"Distribution amounts must be 0 when distribution type is `evenly`",
		},
	)
	.refine(
		(item) =>
			item.type === "percentage"
				? item.distributions.reduce(
						(acc, distribution) => acc + distribution.amount,
						0,
					) === 100
				: true,
		{
			error:
				"Distribution percentages must sum to 100 when distribution type is `percentage`",
		},
	)
	.refine(
		(item) =>
			item.type === "absolute"
				? item.distributions.reduce(
						(acc, distribution) => acc + distribution.amount,
						0,
					) === item.amount
				: true,
		{
			error:
				"Distribution amounts must sum to the item amount when distribution type is `absolute`",
		},
	);

export type Item = z.infer<typeof itemSchema>;

export const itemsBreakdownDistributionSchema = z.object({
	participantId: distributionSchema.shape.participantId,
	percentage: z.number(),
	amount: distributionSchema.shape.amount,
});

export type ItemsBreakdownDistribution = z.infer<
	typeof itemsBreakdownDistributionSchema
>;

const itemsBreakdownSchema = z.object({
	id: itemSchema.shape.id,
	name: itemSchema.shape.name,
	amount: itemSchema.shape.amount,
	paidBy: itemSchema.shape.paidBy,
	type: itemSchema.shape.type,
	distributions: z.array(itemsBreakdownDistributionSchema),
});

export const itemSummaryCodec = z.codec(
	z.array(itemSchema),
	z.array(itemsBreakdownSchema),
	{
		decode: (itemSchema) =>
			itemSchema.map((item) => {
				const distributions = item.distributions.map((distribution) => {
					if (item.type === "evenly")
						return {
							participantId: distribution.participantId,
							percentage: 100 / item.distributions.length,
							amount: item.amount / item.distributions.length,
						};

					if (item.type === "percentage")
						return {
							participantId: distribution.participantId,
							percentage: distribution.amount,
							amount: (item.amount * distribution.amount) / 100,
						};

					return {
						participantId: distribution.participantId,
						percentage: 0,
						amount: distribution.amount,
					};
				});

				return {
					...item,
					distributions,
				};
			}),
		encode: (itemsBreakdownSchema) =>
			itemsBreakdownSchema.map((item) => {
				const distributions = item.distributions.map((distribution) => {
					let amount = 0;

					if (item.type === "percentage") {
						amount = distribution.percentage;
					}

					if (item.type === "absolute") {
						amount = distribution.amount;
					}

					return {
						participantId: distribution.participantId,
						amount,
					};
				});

				return {
					...item,
					distributions,
				};
			}),
	},
);

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

/////////////
// HELPERS //
/////////////

export function createEmptyParticipant(
	payload: Partial<Participant>,
): Participant {
	return {
		id: crypto.randomUUID(),
		name: "",
		...payload,
	};
}

export function createEmptyItem(payload: Partial<Item> = {}): Item {
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
