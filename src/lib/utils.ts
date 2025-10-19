import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Item, ItemsBreakdownDistribution } from "@/lib/schemas";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat(navigator.language, {
		style: "currency",
		currency: "PHP",
	}).format(amount);
}

export function formatPercentage(
	percentage: number,
	opts?: Intl.NumberFormatOptions,
) {
	return new Intl.NumberFormat(navigator.language, {
		style: "percent",
		...opts,
	}).format(percentage);
}

export function buildDistributionAmount({
	item,
	distribution,
}: {
	item: Item;
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
