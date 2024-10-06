import * as v from "valibot";

export const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  emailVerifiedAt: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
});

export const RegisterUserSchema = v.object({
  name: v.pipe(
    v.pick(UserSchema, ["name"]).entries.name,
    v.nonEmpty("Name is required"),
  ),
  email: v.pipe(
    v.pick(UserSchema, ["email"]).entries.email,
    v.email("Invalid Email Address"),
    v.nonEmpty("Email address is required"),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Password is required")),
  confirmPassword: v.pipe(
    v.string(),
    v.nonEmpty("Confirm Password is required"),
  ),
});

export const TransformedRegisterUserSchema = v.pipe(
  RegisterUserSchema,
  v.transform((input) => ({
    name: input.name,
    email: input.email,
    password: input.password,
    password_confirmation: input.confirmPassword,
  })),
);

export type RegisterUserInput = v.InferInput<typeof RegisterUserSchema>;
export type RegisterUserFlatErrors = v.FlatErrors<typeof RegisterUserSchema>;

export const LoginUserSchema = v.pick(RegisterUserSchema, [
  "email",
  "password",
]);

export type LoginUserInput = v.InferInput<typeof LoginUserSchema>;
export type LoginUserFlatErrors = v.FlatErrors<typeof LoginUserSchema>;
