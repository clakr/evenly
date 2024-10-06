<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, type LabelHTMLAttributes } from "vue";

const props = defineProps<{ class?: LabelHTMLAttributes["class"] }>();

const classes = computed(() => twMerge("text-sm font-medium", props.class));
</script>

<template>
  <label :class="classes"><slot /></label>
</template>
