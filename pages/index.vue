<script setup lang="ts">
import * as v from "valibot";
import type { LoginUserFlatErrors, LoginUserInput } from "~/utils/schema";

// LOGIN USER
const { login } = useSanctumAuth();

const form = reactive<LoginUserInput>({
  email: "",
  password: "",
});

const errors = ref<LoginUserFlatErrors>({});

async function handleLoginUser() {
  errors.value = {};

  const { success, issues, output } = v.safeParse(LoginUserSchema, form);
  if (!success) {
    errors.value = v.flatten(issues);
    return console.error("Validation failed");
  }

  await login(output);
}
</script>

<template>
  <form @submit.prevent="handleLoginUser">
    <div>
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        name="email"
        autocomplete="email"
      />
      <span v-if="errors.nested?.email">{{ errors.nested.email }}</span>
    </div>
    <div>
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="current-password"
      />
      <span v-if="errors.nested?.password">{{ errors.nested.password }}</span>
    </div>
    <button>Sign in</button>
  </form>
</template>
