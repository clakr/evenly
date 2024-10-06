import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email("Invalid Email Address"),
    v.nonEmpty("Email Address is required"),
  ),
  password: v.pipe(v.string(), v.nonEmpty("Password is required")),
});

export type LoginInput = v.InferInput<typeof LoginSchema>;
export type LoginFlatErrors = v.FlatErrors<typeof LoginSchema>;

export const RegisterSchema = v.intersect([
  LoginSchema,
  v.object({
    name: v.pipe(v.string(), v.nonEmpty("Name is required")),
    confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty("Confirm Password is required"),
    ),
  }),
]);

export type RegisterInput = v.InferInput<typeof RegisterSchema>;
export type RegisterFlatErrors = v.FlatErrors<typeof RegisterSchema>;
