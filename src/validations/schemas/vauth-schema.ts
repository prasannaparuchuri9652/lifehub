import type { InferOutput } from "valibot";
import { email, minLength, nonEmpty, object, pipe, string, transform } from "valibot";

export const VLoginSchema = object({
  email: pipe(string(), email("Invalid email address")),
  password: pipe(string(), nonEmpty("Password is required")),
});

export const VRegisterSchema = object({
  name: pipe(
    string(),
    nonEmpty("Name is required"),
    transform((v) => v.trim())
  ),
  email: pipe(string(), email("Invalid email address")),
  password: pipe(string(), minLength(8, "Password must be at least 8 characters")),
});

export type ValidatedLogin = InferOutput<typeof VLoginSchema>;
export type ValidatedRegister = InferOutput<typeof VRegisterSchema>;
