import z from "zod";

const password = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters")
  .max(32, "Password must be at most 32 characters");


const email = z.string().trim().email("Invalid email format");

export const loginSchema = {
  bodySchema: z
    .object({
      email,
      password,
    })
    .strict(),
};

export const signupSchema = {
  bodySchema: z
    .object({
      email,
      password,
      name: z.string().max(25),
      confirmPassword: password,
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const changePasswordSchema = {
  bodySchema: z
    .object({
      currentPassword: password,
      newPassword: password,
      confirmPassword: password,
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};
