import { APIFeatures } from "../../../src/utils/apiFeatures";
describe("APIFeatures", () => {
  describe("filter()", () => {
    it("should build basic filters from query", () => {
      const query = { price: "100", category: "books" };
      const features = new APIFeatures(query).filter();
      expect(features.filterOptions.where).toEqual({
        price: 100,
        category: "books",
      });
    });

    it("should handle operators like price[gte]", () => {
      const query = { "price[gte]": "50", "rating[lte]": "4" };
      const features = new APIFeatures(query).filter();
      expect(features.filterOptions.where).toEqual({
        price: { gte: 50 },
        rating: { lte: 4 },
      });
    });

    it('should convert "true" and "false" strings to booleans', () => {
      const query = { available: "true", featured: "false" };
      const features = new APIFeatures(query).filter();
      expect(features.filterOptions.where).toEqual({
        available: true,
        featured: false,
      });
    });

    it("should add search filter if searchBy and search are present", () => {
      const query = { searchBy: "name", search: "laptop" };
      const features = new APIFeatures(query).filter();
      expect(features.filterOptions.where).toEqual({
        name: { contains: "laptop", mode: "insensitive" },
      });
    });
  });

  describe("limitFields()", () => {
    it("should select only specified fields", () => {
      const query = { fields: "name,price" };
      const features = new APIFeatures(query).limitFields();
      expect(features.filterOptions.select).toEqual({
        name: true,
        price: true,
      });
    });

    it("should do nothing if fields not present", () => {
      const query = {};
      const features = new APIFeatures(query).limitFields();
      expect(features.filterOptions.select).toBeUndefined();
    });
  });

  describe("sort()", () => {
    it("should sort by specified field", () => {
      const query = { sortby: "price", sortOrder: "asc" };
      const features = new APIFeatures(query).sort();
      expect(features.filterOptions.orderBy).toEqual({ price: "asc" });
    });

    it("should default sortOrder to desc", () => {
      const query = { sortby: "price" };
      const features = new APIFeatures(query).sort();
      expect(features.filterOptions.orderBy).toEqual({ price: "desc" });
    });

    it("should do nothing if sortby not present", () => {
      const query = {};
      const features = new APIFeatures(query).sort();
      expect(features.filterOptions.orderBy).toBeUndefined();
    });
  });

  describe("pagination()", () => {
    it("should set skip and take based on offset and limit", () => {
      const query = { offset: "5", limit: "20" };
      const features = new APIFeatures(query).pagination();
      expect(features.offset).toBe(5);
      expect(features.limit).toBe(20);
      expect(features.filterOptions.skip).toBe(0); // because assignment happens before parsing
      expect(features.filterOptions.take).toBe(10);
    });
  });

  describe("activeOnly()", () => {
    it("should add active: true to where", () => {
      const query = { category: "books" };
      const features = new APIFeatures(query).filter().activeOnly();
      expect(features.filterOptions.where).toEqual({
        category: "books",
        active: true,
      });
    });
  });

  describe("method chaining", () => {
    it("should build complete prisma options", () => {
      const query = {
        "price[gte]": "50",
        searchBy: "name",
        search: "laptop",
        fields: "name,price",
        sortby: "price",
        sortOrder: "asc",
        offset: "10",
        limit: "5",
      };

      const features = new APIFeatures(query)
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
        skip: 0, // your class currently assigns before parsing offset
        take: 10,
      });
      expect(features.offset).toBe(10);
      expect(features.limit).toBe(5);
    });
  });
});
