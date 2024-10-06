<script setup lang="ts">
import * as v from "valibot";
import type { RegisterFlatErrors, RegisterInput } from "~/utils/schema";

// REGISTER USER
const client = useSanctumClient();
const user = useSanctumUser();

const form = reactive<RegisterInput>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = ref<RegisterFlatErrors>({});

async function handleRegisterUser() {
  errors.value = {};

  const parsedData = v.safeParse(RegisterSchema, form);
  if (!parsedData.success) {
    errors.value = v.flatten(parsedData.issues);
    return console.error("Validation failed");
  }

  await client("/register", {
    method: "post",
    body: {
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword,
    },
  });

  user.value = await client("/api/user");
}
</script>

<template>
  <form @submit.prevent="handleRegisterUser">
    <div>
      <label for="name">Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        name="name"
        autocomplete="name"
      />
      <span v-if="errors.nested?.name">{{ errors.nested.name }}</span>
    </div>
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
    <div>
      <label for="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        name="confirmPassword"
        autocomplete="current-password"
      />
      <span v-if="errors.nested?.confirmPassword">
        {{ errors.nested.confirmPassword }}
      </span>
    </div>
    <button>Sign Up</button>
  </form>
</template>
