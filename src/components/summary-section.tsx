import { ArrowRight, Banknote, Equal, Percent, User } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemHeader,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import {
	type ItemsBreakdownDistribution,
	type Item as ItemType,
	itemSummaryCodec,
	type Participant,
} from "@/lib/schemas";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

type Props = {
	participants: Participant[];
	items: ItemType[];
};

export function SummarySection({ participants, items }: Props) {
	function findParticipantName(participantId: Participant["id"]) {
		return participants.find((participant) => participant.id === participantId)
			?.name;
	}

	function getItemTypeIcon(type: ItemType["type"]) {
		if (type === "evenly") return <Equal />;
		else if (type === "percentage") return <Percent />;

		return <Banknote />;
	}

	const itemsBreakdown = itemSummaryCodec.decode(items);

	function buildDistributionAmount({
		item,
		distribution,
	}: {
		item: ItemType;
		distribution: ItemsBreakdownDistribution;
	}) {
		const amount: string[] = [];

		if (item.type === "percentage" || item.type === "evenly") {
			amount.push(
				formatPercentage(distribution.percentage / 100, {
					maximumFractionDigits: 2,
				}),
			);
			amount.push("=");
			amount.push(formatCurrency(distribution.amount));
		}

		if (item.type === "absolute") {
			amount.push(formatCurrency(distribution.amount));
		}

		return amount.join(" ");
	}

	const totalParticipants = itemsBreakdown.reduce<Array<Participant["id"]>>(
		(acc, item) => {
			item.distributions.forEach((distribution) => {
				if (!acc.includes(distribution.participantId)) {
					acc.push(distribution.participantId);
				}
			});

			return acc;
		},
		[],
	);

	const totalAmount = itemsBreakdown.reduce(
		(acc, item) => acc + item.amount,
		0,
	);

	const paymentOverview = totalParticipants.reduce<
		Record<
			Participant["id"],
			{
				paid: number;
				owes: number;
				balance: number;
			}
		>
	>((acc, participantId) => {
		const name = findParticipantName(participantId) || "";

		const paid = itemsBreakdown.reduce(
			(acc, item) => (item.paidBy === participantId ? acc + item.amount : acc),
			0,
		);

		const owes = itemsBreakdown.reduce((acc, item) => {
			item.distributions.forEach((distribution) => {
				if (distribution.participantId === participantId) {
					acc += distribution.amount;
				}
			});

			return acc;
		}, 0);

		const balance = paid - owes;

		acc[name] = {
			paid,
			owes,
			balance,
		};

		return acc;
	}, {});

	function calculateSettlements() {
		const balances = Object.entries(paymentOverview).map(
			([name, { balance }]) => ({
				name,
				balance,
			}),
		);

		const creditors = balances
			.filter(({ balance }) => balance > 0.01)
			.sort((a, b) => b.balance - a.balance);
		const debtors = balances
			.filter(({ balance }) => balance < -0.01)
			.sort((a, b) => a.balance - b.balance);

		const settlements = [];

		let creditorsIndex = 0;
		let debtorsIndex = 0;

		while (creditorsIndex < creditors.length && debtorsIndex < debtors.length) {
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
	}

	const settlements = calculateSettlements();

	return (
		<>
			<section className="flex flex-wrap gap-2">
				<h2 className="font-medium text-sm basis-full uppercase">
					Participants
				</h2>
				{totalParticipants.map((participantId) => (
					<Badge key={participantId}>
						<User />
						{findParticipantName(participantId)}
					</Badge>
				))}
			</section>
			<Separator />
			<section>
				<h2 className="font-medium text-sm uppercase">Items Breakdown</h2>
				<ItemGroup>
					{itemsBreakdown.map((item) => (
						<Fragment key={item.id}>
							<Item key={item.id} className="border-b border">
								<ItemHeader>
									<span>{item.name}</span>
									<span>{formatCurrency(item.amount)}</span>
								</ItemHeader>
								<ItemContent>
									<ItemTitle className="justify-between w-full">
										<span>
											Paid By: <b>{findParticipantName(item.paidBy)}</b>
										</span>
										<span>{getItemTypeIcon(item.type)}</span>
									</ItemTitle>
									<ul className="ps-4 text-muted-foreground leading-normal">
										{item.distributions.map((distribution) => (
											<li
												key={distribution.participantId}
												className="flex justify-between items-center"
											>
												<span>
													{findParticipantName(distribution.participantId)}
												</span>
												<span>
													{buildDistributionAmount({ item, distribution })}
												</span>
											</li>
										))}
									</ul>
								</ItemContent>
							</Item>
							<ItemSeparator />
						</Fragment>
					))}
					<Item>
						<ItemHeader>
							<ItemTitle className="justify-between w-full font-bold text-base">
								<span className="uppercase">Total</span>
								<span>{formatCurrency(totalAmount)}</span>
							</ItemTitle>
						</ItemHeader>
					</Item>
				</ItemGroup>
			</section>
			<Separator />
			<section>
				<h2 className="font-medium text-sm uppercase">Payment Overview</h2>
				<ItemGroup>
					{Object.entries(paymentOverview).map(
						([name, { paid, owes, balance }]) => (
							<Item key={name}>
								<ItemHeader>{name}</ItemHeader>
								<ItemContent className="ps-4 text-muted-foreground leading-normal flex flex-col gap-y-2 *:flex *:items-center *:justify-between">
									<div>
										<span>Paid</span>
										<span>{formatCurrency(paid)}</span>
									</div>
									<div>
										<span>Owes</span>
										<span>{formatCurrency(owes)}</span>
									</div>
									<Separator />
									<div>
										<span>Balance</span>
										<span
											className={cn(
												balance > 0 ? "text-green-600" : "text-red-600",
											)}
										>
											{formatCurrency(balance)}
										</span>
									</div>
								</ItemContent>
							</Item>
						),
					)}
				</ItemGroup>
			</section>
			<Separator />
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
}
