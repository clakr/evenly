<script setup lang="ts">
import type { NuxtLinkProps } from "#app";
import { twMerge } from "tailwind-merge";
import { computed, type ButtonHTMLAttributes } from "vue";

type Variant = "filled" | "link";

const props = withDefaults(
  defineProps<{
    class?: ButtonHTMLAttributes["class"];
    variant?: Variant;
    to?: NuxtLinkProps["to"];
  }>(),
  {
    class: "",
    variant: "filled",
    to: "",
  },
);

const DEFAULT_CLASSES =
  "whitespace-nowrap rounded text-sm font-medium focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-slate-600";

const variants = new Map<Variant, string>([
  [
    "filled",
    "bg-slate-600 px-4 py-2 text-white [&:is(:hover,:focus)]:bg-slate-700",
  ],
  ["link", "text-slate-600 hover:underline"],
]);

const classes = computed(() =>
  twMerge(DEFAULT_CLASSES, variants.get(props.variant), props.class),
);
</script>

<template>
  <NuxtLink v-if="to" :to :class="classes">
    <slot />
  </NuxtLink>
  <button v-else :class="classes">
    <slot />
  </button>
</template>
