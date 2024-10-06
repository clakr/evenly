<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, type ButtonHTMLAttributes } from "vue";

type Variant = "filled";

const props = withDefaults(
  defineProps<{ class?: ButtonHTMLAttributes["class"]; variant?: Variant }>(),
  {
    class: "",
    variant: "filled",
  },
);

const variants = new Map<Variant, string>([
  [
    "filled",
    "whitespace-nowrap rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-slate-600 [&:is(:hover,:focus)]:bg-slate-700",
  ],
]);

const classes = computed(() =>
  twMerge("", variants.get(props.variant), props.class),
);
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
