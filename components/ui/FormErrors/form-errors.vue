<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  errors: [string, ...string[]];
}>();

const classes = computed(() =>
  twMerge("list-disc list-inside text-red-400 ms-2 text-xs mt-1", props.class),
);
</script>

<template>
  <ul :class="classes">
    <li v-for="error in errors" :key="error">{{ error }}</li>
  </ul>
</template>
