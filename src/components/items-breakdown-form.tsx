import { useStore } from "@tanstack/react-form";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Item,
	ItemContent,
	ItemFooter,
	ItemGroup,
	ItemHeader,
} from "@/components/ui/item";
import { formOpts, withForm } from "@/lib/form";
import {
	type ItemsBreakdownDistribution,
	type Item as ItemType,
	itemSummaryCodec,
} from "@/lib/schemas";
import { useAlert } from "@/lib/use-alert";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export const ItemsBreakdownForm = withForm({
	...formOpts,
	render: function Render({ form }) {
		const { items } = useStore(form.store, (state) => state.values);

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

		const { show } = useAlert();

		function handleDeleteItem(index: number) {
			show({
				title: "Delete Item",
				description: `Are you sure you want to delete "${items[index].name}"?`,
				actionText: "Delete",
				onAction: () => {
					form.removeFieldValue("items", index);
				},
			});
		}

		return (
			<section className="grid gap-y-[calc(var(--gutter-block)/2)]">
				<h2 className="font-medium">Items Breakdown</h2>
				<ItemGroup className="font-mono gap-y-[calc(var(--gutter-block)/2)]">
					{itemsBreakdown.map((item, index) => (
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
											<span>{distribution.participantName}</span>
											<span>
												{buildDistributionAmount({ item, distribution })}
											</span>
										</li>
									))}
								</ul>
							</ItemContent>
							<ItemFooter>
								<span>
									Paid by: <b className="font-semibold">{item.paidBy.name}</b>
								</span>
								<ButtonGroup>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										title="Edit Item"
										aria-label="Edit Item"
										className="text-muted-foreground"
										disabled
									>
										<Edit />
										<span className="sr-only">Edit Item</span>
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										title="Delete Item"
										aria-label="Delete Item"
										className="text-muted-foreground"
										onClick={() => handleDeleteItem(index)}
									>
										<Trash />
										<span className="sr-only">Delete Item</span>
									</Button>
								</ButtonGroup>
							</ItemFooter>
						</Item>
					))}
				</ItemGroup>
			</section>
		);
	},
});
