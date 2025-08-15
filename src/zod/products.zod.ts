import z from "zod";
import { params } from "./genetic.zod";

export const createProduct = {
  bodySchema: z.object({
    name: z.string().max(100),
    description: z.string().max(200),
    price: z.preprocess((val) => Number(val), z.number()),
    category: z.string().max(50),
    images: z.array(z.string().url()),
    inventoryCount: z.preprocess((val) => Number(val), z.number()),
  }),
};

export const updateProduct = {
  bodySchema: z.object({
    name: z.string().max(100).optional(),
    description: z.string().max(200).optional(),
    price: z.number().optional(),
    category: z.string().max(50).optional(),
    images: z.array(z.string().url()),
    inventoryCount: z.number().optional(),
  }),
  params,
};
