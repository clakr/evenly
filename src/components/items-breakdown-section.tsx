import { Banknote, Equal, Percent } from "lucide-react";
import {
	Item,
	ItemContent,
	ItemFooter,
	ItemGroup,
	ItemHeader,
} from "@/components/ui/item";
import {
	type Item as ItemType,
	itemSummaryCodec,
	type Participant,
} from "@/lib/schemas";
import { buildDistributionAmount, formatCurrency } from "@/lib/utils";

type Props = {
	items: ItemType[];
	findParticipantName: (participantId: Participant["id"]) => string | undefined;
};

export function ItemsBreakdownSection({ items, findParticipantName }: Props) {
	const itemsBreakdown = itemSummaryCodec.decode(items);

	function getItemTypeIcon(type: ItemType["type"]) {
		if (type === "evenly") return <Equal />;
		else if (type === "percentage") return <Percent />;

		return <Banknote />;
	}

	return (
		<section className="grid gap-y-[calc(var(--gutter-block)/2)]">
			<h2 className="font-medium">Items Breakdown</h2>
			<ItemGroup className="gap-y-[calc(var(--gutter-block)/2)] font-mono">
				{itemsBreakdown.map((item) => (
					<Item key={item.id} variant="muted">
						<ItemHeader className="font-bold">
							<span>{item.name}</span>
							<span>{formatCurrency(item.amount)}</span>
						</ItemHeader>
						<ItemContent>
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
						<ItemFooter>
							<span>
								Paid by: <b>{findParticipantName(item.paidBy)}</b>
							</span>
							<span>{getItemTypeIcon(item.type)}</span>
						</ItemFooter>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}
