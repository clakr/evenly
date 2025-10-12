import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
