<script setup lang="ts">
import { LoginUserSchema, reactive, ref, useSanctumAuth } from "#imports";
import * as v from "valibot";
import { Button } from "~/components/ui/Button";
import { FormErrors } from "~/components/ui/FormErrors";
import { Input } from "~/components/ui/Input";
import { Label } from "~/components/ui/Label";
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
  <main class="grid min-h-screen place-content-center">
    <form
      class="flex w-[calc(100svw-2rem)] max-w-sm flex-col gap-y-3 rounded border border-slate-200 bg-white p-4 shadow shadow-slate-200"
      @submit.prevent="handleLoginUser"
    >
      <header class="flex flex-col gap-y-1">
        <h1 class="text-2xl font-bold">Login</h1>
        <p class="text-sm text-slate-950/50">
          Enter your email address and password to login to your account.
        </p>
      </header>
      <div class="flex flex-col gap-y-1">
        <Label for="email">Email Address</Label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          required
        />
        <FormErrors
          v-if="errors.nested?.email"
          :errors="errors.nested?.email"
        />
      </div>
      <div class="flex flex-col gap-y-1">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
        <FormErrors
          v-if="errors.nested?.password"
          :errors="errors.nested?.password"
        />
      </div>
      <Button class="mt-3">Sign in</Button>
    </form>
  </main>
</template>
