import z from "zod";

export const validId = z
  .string()
  .regex(/^[0-9]+$/, { message: "ID must contain only digits" });

export const params = {
  paramsSchema: z
    .object({
      id: validId,
    })
    .strict(),
};
