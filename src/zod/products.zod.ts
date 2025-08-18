import z from "zod";
import { params } from "./genetic.zod";

export const createProduct = {
  bodySchema: z.object({
    name: z.string().max(100),
    description: z.string().max(500),
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
    price: z.preprocess((val) => Number(val), z.number()).optional(),
    category: z.string().max(50).optional(),
    images: z.array(z.string().url()).optional(),
    inventoryCount: z.preprocess((val) => Number(val), z.number()).optional(),
  }),
  params,
};
export const searchProduct = {
  querySchema: z.object({
    limit: z.coerce.number().max(49, "limit must be less than 50").optional(),
  }),
};
