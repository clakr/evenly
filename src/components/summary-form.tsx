import { useStore } from "@tanstack/react-form";
import { ArrowRight, User } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemContent,
	ItemFooter,
	ItemGroup,
	ItemHeader,
	ItemSeparator,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { formOpts, withForm } from "@/lib/form";
import {
	type Item as ItemType,
	itemSummaryCodec,
	type Participant,
} from "@/lib/schemas";
import { cn, formatCurrency } from "@/lib/utils";

type ParticipantItems = {
	id: Participant["id"];
	name: Participant["name"];
	items: {
		id: ItemType["id"];
		name: ItemType["name"];
		amount: number;
	}[];
};

type PaymentOverview = {
	id: Participant["id"];
	name: Participant["name"];
	paid: number;
	owes: number;
	balance: number;
};

function createEmptyParticipantItems(
	payload: Partial<ParticipantItems> = {},
): ParticipantItems {
	return {
		id: "",
		name: "",
		items: [],
		...payload,
	};
}

export const SummaryForm = withForm({
	...formOpts,
	render: function Render({ form }) {
		const { items, participants } = useStore(
			form.store,
			(state) => state.values,
		);

		const itemsBreakdown = itemSummaryCodec.decode(items);

		const participantItemsBreakdown = useMemo(() => {
			const map = new Map<Participant["id"], ParticipantItems>();

			itemsBreakdown.forEach((item) => {
				item.distributions.forEach((distribution) => {
					const participant = map.get(distribution.participantId);

					const payload = createEmptyParticipantItems({
						id: distribution.participantId,
						name: participants.find(
							(participant) => participant.id === distribution.participantId,
						)?.name,
						...participant,
					});

					payload.items.push({
						id: item.id,
						name: item.name,
						amount: distribution.amount,
					});

					map.set(distribution.participantId, payload);
				});
			});

			return Array.from(map.values());
		}, [itemsBreakdown, participants]);

		const paymentOverview = useMemo(
			() =>
				participantItemsBreakdown.map<PaymentOverview>((participant) => {
					const paid = itemsBreakdown.reduce(
						(acc, item) =>
							acc + (item.paidBy === participant.id ? item.amount : 0),
						0,
					);

					const owes = participant.items.reduce(
						(acc, item) => acc + item.amount,
						0,
					);

					const balance = paid - owes;

					return {
						id: participant.id,
						name: participant.name,
						paid,
						owes,
						balance,
					};
				}),
			[participantItemsBreakdown, itemsBreakdown],
		);

		const settlements = useMemo(() => {
			const balances = Object.values(paymentOverview).map((participant) => ({
				name: participant.name,
				balance: participant.balance,
			}));

			const creditors = balances
				.filter(({ balance }) => balance > 0.01)
				.sort((a, b) => b.balance - a.balance);
			const debtors = balances
				.filter(({ balance }) => balance < -0.01)
				.sort((a, b) => a.balance - b.balance);

			const settlements = [];

			let creditorsIndex = 0;
			let debtorsIndex = 0;

			while (
				creditorsIndex < creditors.length &&
				debtorsIndex < debtors.length
			) {
				const creditor = creditors[creditorsIndex];
				const debtor = debtors[debtorsIndex];

				const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

				settlements.push({
					from: debtor.name,
					to: creditor.name,
					amount,
				});

				creditor.balance -= amount;
				debtor.balance += amount;

				if (creditor.balance < 0.01) creditorsIndex++;
				if (Math.abs(debtor.balance) < 0.01) debtorsIndex++;
			}

			return settlements;
		}, [paymentOverview]);

		return (
			<>
				<section className="flex flex-wrap gap-2">
					<h2 className="font-medium text-sm basis-full uppercase">
						Participants
					</h2>
					{participantItemsBreakdown.map((participant) => (
						<Badge key={participant.id}>
							<User />
							{participant.name}
						</Badge>
					))}
				</section>
				<section>
					<h2 className="font-medium text-sm basis-full uppercase">
						Participants Breakdown
					</h2>
					<ItemGroup>
						{participantItemsBreakdown.map((participant) => (
							<Item key={participant.id}>
								<ItemHeader>{participant.name}</ItemHeader>
								<ItemContent className="ps-4 text-muted-foreground">
									<ul className="flex flex-col gap-y-1">
										{participant.items.map((item) => (
											<li
												key={item.id}
												className="flex items-center justify-between"
											>
												<span>{item.name}</span>
												<span>{formatCurrency(item.amount)}</span>
											</li>
										))}
									</ul>
								</ItemContent>
								<ItemSeparator />
								<ItemFooter className="font-bold ps-4">
									<span className="uppercase">Total</span>
									<span>
										{formatCurrency(
											participant.items.reduce(
												(acc, item) => acc + item.amount,
												0,
											),
										)}
									</span>
								</ItemFooter>
							</Item>
						))}
					</ItemGroup>
				</section>
				<section>
					<h2 className="font-medium text-sm uppercase">Payment Overview</h2>
					<ItemGroup>
						{Object.values(paymentOverview).map((participant) => (
							<Item key={participant.id}>
								<ItemHeader>{participant.name}</ItemHeader>
								<ItemContent className="ps-4 text-muted-foreground leading-normal flex flex-col gap-y-2 *:flex *:items-center *:justify-between">
									<div>
										<span>Paid</span>
										<span>{formatCurrency(participant.paid)}</span>
									</div>
									<div>
										<span>Owes</span>
										<span>{formatCurrency(participant.owes)}</span>
									</div>
									<Separator />
									<div>
										<span>Balance</span>
										<span
											className={cn(
												participant.balance > 0
													? "text-green-600"
													: "text-red-600",
											)}
										>
											{formatCurrency(participant.balance)}
										</span>
									</div>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</section>
				<section>
					<h2 className="font-medium text-sm uppercase">Settlements</h2>
					<ItemGroup>
						{settlements.map((settlement) => (
							<Item key={`${settlement.from}-${settlement.to}`}>
								<ItemHeader className="items-center">
									<span className="flex items-center gap-x-2">
										{settlement.from}
										<ArrowRight className="size-3" />
										{settlement.to}
									</span>
									<span className="text-base font-bold">
										{formatCurrency(settlement.amount)}
									</span>
								</ItemHeader>
							</Item>
						))}
					</ItemGroup>
				</section>
			</>
		);
	},
});
