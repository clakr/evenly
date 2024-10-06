<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, type InputHTMLAttributes } from "vue";

const model = defineModel<string>();

const props = defineProps<{ class?: InputHTMLAttributes["class"] }>();

const classes = computed(() =>
  twMerge(
    "rounded border border-slate-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-slate-600 px-2 py-1",
    props.class,
  ),
);
</script>

<template>
  <input v-model="model" :class="classes" />
</template>
