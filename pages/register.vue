<script setup lang="ts">
import {
  reactive,
  ref,
  TransformedRegisterUserSchema,
  useSanctumClient,
  useSanctumUser,
} from "#imports";
import * as v from "valibot";
import { Button } from "~/components/ui/Button";
import { FormErrors } from "~/components/ui/FormErrors";
import { Input } from "~/components/ui/Input";
import { Label } from "~/components/ui/Label";
import type { RegisterUserFlatErrors, RegisterUserInput } from "~/utils/schema";

// REGISTER USER
const client = useSanctumClient();
const user = useSanctumUser();

const form = reactive<RegisterUserInput>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = ref<RegisterUserFlatErrors>({});

async function handleRegisterUser() {
  errors.value = {};

  const { success, issues, output } = v.safeParse(
    TransformedRegisterUserSchema,
    form,
  );
  if (!success) {
    errors.value = v.flatten(issues);
    return console.error("Validation failed");
  }

  await client("/register", {
    method: "post",
    body: output,
  });

  user.value = await client("/api/user");
}
</script>

<template>
  <main class="grid min-h-screen place-content-center">
    <div
      class="flex w-[calc(100svw-2rem)] max-w-md flex-col gap-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200"
    >
      <header>
        <h1 class="text-2xl font-bold">Register</h1>
        <p class="text-sm text-slate-950/50">
          Enter your information to create your account
        </p>
      </header>
      <form class="flex flex-col gap-y-4" @submit.prevent="handleRegisterUser">
        <div class="flex flex-col gap-y-1">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="form.name"
            type="text"
            name="name"
            autocomplete="name"
          />
          <FormErrors v-if="errors.nested?.name" :errors="errors.nested.name" />
        </div>
        <div class="flex flex-col gap-y-1">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            name="email"
            autocomplete="email"
          />
          <FormErrors
            v-if="errors.nested?.email"
            :errors="errors.nested.email"
          />
        </div>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="flex flex-col gap-y-1">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              name="password"
              autocomplete="current-password"
            />
            <FormErrors
              v-if="errors.nested?.password"
              :errors="errors.nested.password"
            />
          </div>
          <div class="flex flex-col gap-y-1">
            <Label for="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              name="confirmPassword"
              autocomplete="current-password"
            />
            <FormErrors
              v-if="errors.nested?.confirmPassword"
              :errors="errors.nested.confirmPassword"
            />
          </div>
        </div>
        <Button class="mt-2">Sign Up</Button>
      </form>
      <footer class="text-center text-sm">
        Already have an account?
        <Button variant="link" to="/">Sign in</Button>
      </footer>
    </div>
  </main>
</template>
