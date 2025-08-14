import z from "zod";

export const createOrder = {
  bodySchema: {
    items: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    ),
  },
};

const data = [
  { productId: 12, quantity: 12 },
  { productId: 14, quantity: 4 },
  { productId: 16, quantity: 4 },
];
