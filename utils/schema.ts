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
