import { APIFeatures } from "../../../src/utils/apiFeatures";
import { Request } from "express";

describe("APIFeatures", () => {
  describe("filter()", () => {
    it("should build basic filters from query", () => {
      const req = { query: { price: "100", category: "books" } } as unknown as Request;
      const features = new APIFeatures(req).filter();
      expect(features.filterOptions.where).toEqual({
        price: 100,
        category: "books",
      });
    });

    it("should handle operators like price[gte]", () => {
      const req = { query: { "price[gte]": "50", "rating[lte]": "4" } } as unknown as Request;
      const features = new APIFeatures(req).filter();
      expect(features.filterOptions.where).toEqual({
        price: { gte: 50 },
        rating: { lte: 4 },
      });
    });

    it('should convert "true" and "false" strings to booleans', () => {
      const req = { query: { available: "true", featured: "false" } } as unknown as Request;
      const features = new APIFeatures(req).filter();
      expect(features.filterOptions.where).toEqual({
        available: true,
        featured: false,
      });
    });

    it("should add search filter if searchBy and search are present", () => {
      const req = { query: { searchBy: "name", search: "laptop" } } as unknown as Request;
      const features = new APIFeatures(req).filter();
      expect(features.filterOptions.where).toEqual({
        name: { contains: "laptop", mode: "insensitive" },
      });
    });
  });

  describe("limitFields()", () => {
    it("should select only specified fields", () => {
      const req = { query: { fields: "name,price" } } as unknown as Request;
      const features = new APIFeatures(req).limitFields();
      expect(features.filterOptions.select).toEqual({
        name: true,
        price: true,
      });
    });

    it("should do nothing if fields not present", () => {
      const req = { query: {} } as unknown as Request;
      const features = new APIFeatures(req).limitFields();
      expect(features.filterOptions.select).toBeUndefined();
    });
  });

  describe("sort()", () => {
    it("should sort by specified field", () => {
      const req = { query: { sortby: "price", sortOrder: "asc" } } as unknown as Request;
      const features = new APIFeatures(req).sort();
      expect(features.filterOptions.orderBy).toEqual({ price: "asc" });
    });

    it("should default sortOrder to desc", () => {
      const req = { query: { sortby: "price" } } as unknown as Request;
      const features = new APIFeatures(req).sort();
      expect(features.filterOptions.orderBy).toEqual({ price: "desc" });
    });

    it("should do nothing if sortby not present", () => {
      const req = { query: {} } as unknown as Request;
      const features = new APIFeatures(req).sort();
      expect(features.filterOptions.orderBy).toBeUndefined();
    });
  });

  describe("pagination()", () => {
    it("should set skip and take based on offset and limit", () => {
      const req = { query: { offset: "5", limit: "20" } } as unknown as Request;
      const features = new APIFeatures(req).pagination();
      expect(features.offset).toBe(5);
      expect(features.limit).toBe(20);
    });
  });

  describe("activeOnly()", () => {
    it("should add active: true to where", () => {
      const req = { query: { category: "books" } } as unknown as Request;
      const features = new APIFeatures(req).filter().activeOnly();
      expect(features.filterOptions.where).toEqual({
        category: "books",
        active: true,
      });
    });
  });

  describe("method chaining", () => {
    it("should build complete prisma options", () => {
      const req = {
        query: {
          "price[gte]": "50",
          searchBy: "name",
          search: "laptop",
          fields: "name,price",
          sortby: "price",
          sortOrder: "asc",
          offset: "10",
          limit: "5",
        },
      } as unknown as Request;

      const features = new APIFeatures(req)
        .filter()
        .limitFields()
        .sort()
        .pagination()
        .activeOnly();

      expect(features.filterOptions).toEqual({
        where: {
          price: { gte: 50 },
          name: { contains: "laptop", mode: "insensitive" },
          active: true,
        },
        select: { name: true, price: true },
        orderBy: { price: "asc" },
        skip: 0, // adjust if your class sets skip differently
        take: 10,
      });
      expect(features.offset).toBe(10);
      expect(features.limit).toBe(5);
    });
  });
});
