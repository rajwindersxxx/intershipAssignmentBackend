import z from "zod";

export const createOrder = {
  bodySchema: z.object({
    items: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    ).min(1),
  }),
};
