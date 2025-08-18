/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
type SortOrder = "asc" | "desc";

interface PrismaFilterOptions {
  where?: Record<string, unknown>;
  select?: Record<string, boolean>;
  orderBy?: Record<string, SortOrder>;
  skip?: number;
  take?: number;
}
/**
 * Utility class to transform `req.query` into Prisma-compatible options
 * (filters, pagination, sorting, field selection).
 *
 * ⚠️ Important:
 * - `ignore` removes query params silently. If you forget to include a key in `ignore`,
 *   it will be treated as a Prisma filter.
 * - All query values are strings by default; this class attempts to coerce them
 *   into numbers or booleans where possible (`"true" => true`, `"42" => 42`).
 *
 * @example
 * // GET /products?price[gte]=100&limit=5&offset=10&fields=name,price
 * const { filterOptions } = new APIFeatures(req, { ignore: ["custom"] })
 *   .filter()
 *   .limitFields()
 *   .sort()
 *   .pagination();
 *
 * prisma.product.findMany(filterOptions);
 *
 * @param req - Express Request (uses req.query)
 * @param ignore - Optional. Keys that should not be converted into Prisma filters.
 *                  Example: `{ ignore: ["custom", "internal"] }`
 */
export class APIFeatures {
  private req: Request;
  private queryString: typeof this.req.query;
  filterOptions: PrismaFilterOptions;
  limit: number;
  offset: number;
  ignore?: { ignore: string[] };
  constructor(req: Request, ignore?: { ignore: string[] }) {
    this.req = req;
    this.ignore = ignore;
    this.filterOptions = {};
    this.queryString = req.query;
    this.limit = 10;
    this.offset = 0;
    this.ignore?.ignore.map((item) => {
      delete this.queryString[item];
    });
  }
  filter() {
    const {
      fields,
      sortby,
      sortOrder,
      limit,
      offset,
      searchBy,
      search,
      ...otherFields
    } = this.queryString;

    const selectedFilters: Record<string, unknown> = {};

    for (const [rawKey, rawValue] of Object.entries(otherFields)) {
      const match = rawKey.match(/^(\w+)(\[(\w+)\])?$/);
      if (!match) continue;
      const [field, _, operator] = match;
      let value: unknown = rawValue;
      if (rawValue === "true") value = true;
      else if (rawValue === "false") value = false;
      else if (!isNaN(Number(rawValue))) value = Number(rawValue);

      if (operator) {
        selectedFilters[field] = { [operator]: value };
      } else {
        selectedFilters[field] = value;
      }
    }
    if (searchBy && search) {
      selectedFilters[searchBy as string] = {
        contains: search,
        mode: "insensitive",
      };
    }

    this.filterOptions = { ...this.filterOptions, where: selectedFilters };
    return this;
  }
  limitFields() {
    const { fields } = this.queryString;
    const selectedField: { [key: string]: boolean } = {};
    if (fields) {
      String(fields)
        .split(",")
        .forEach((item: string) => {
          return (selectedField[item] = true);
        });
      this.filterOptions = { ...this.filterOptions, select: selectedField };
    }
    return this;
  }
  sort() {
    const { sortby, sortOrder } = this.queryString;
    const order = sortOrder === "asc" ? "asc" : "desc";
    if (sortby && typeof sortby === "string") {
      this.filterOptions = {
        ...this.filterOptions,
        orderBy: { [sortby]: order },
      };
    }
    return this;
  }
  pagination() {
    const { offset, limit } = this.queryString;
    this.filterOptions = {
      ...this.filterOptions,
      skip: this.offset,
      take: this.limit,
    };

    if (offset) this.offset = Number(offset);
    if (limit) this.limit = Number(limit);
    return this;
  }
  activeOnly() {
    this.filterOptions = {
      ...this.filterOptions,
      where: {
        ...this.filterOptions.where,
        active: true,
      },
    };
    return this;
  }
}
