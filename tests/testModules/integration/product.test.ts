import { Product } from "../../../generated/prisma";
import { prisma } from "../../../src/utils/prismaClient";
import { testFactory } from "../../testHelpers/testFactory";
import { testCatchAsync } from "../../testHelpers/utils";
const tf = new testFactory();

describe("Product route tests", () => {
  let product: Product;

  const randomEmail = `test${Date.now()}@gmail.com`;
  const productData = {
    name: `Product ${Date.now()}`,
    description: "Test product",
    price: 1234,
    category: "test",
    imageUrl: "https://tiven.xyz",
    inventoryCount: 10,
  };

  beforeAll(async () => {
    // Create admin user
    await testCatchAsync(async () => {
      await prisma.user.create({
        data: {
          email: randomEmail,
          password:
            "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC", // => 123456
          name: "test user",
          role: "ADMIN",
        },
      });
    });
    // Setup testFactory with login
    await tf.setup(randomEmail, "123456");
  });

  it("should get all products", async () => {
    const res = await tf.get({ path: "/product" });
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("should create a new product", async () => {
    const res = await tf.post({
      path: "/product",
      data: productData,
      expectedStatus: 201,
    });
    product = res.data;
    expect(product).toHaveProperty("id");
    expect(product.name).toBe(productData.name);
  });

  it("should fail to create product with missing fields", async () => {
    await tf.post({
      path: "/product",
      data: { name: "" }, // invalid
      expectedStatus: 400,
    });
  });

  it("should update the product", async () => {
    const updatedData = { ...productData, name: "Updated Product" };
    const res = await tf.patch({
      path: "/product",
      id: product.id,
      data: updatedData,
      expectedStatus: 200,
    });
    expect(res.data.name).toBe("Updated Product");
  });

  it("should get product details", async () => {
    const res = await tf.get({
      path: "/product",
      id: product.id,
      expectedStatus: 200,
    });
    expect(res.data.id).toBe(product.id);
  });

  it("should soft delete the product", async () => {
    await tf.delete({
      path: "/product",
      id: product.id,
    });
  });

  it("should fail to delete already deleted product", async () => {
    await tf.delete({
      path: "/product",
      id: product.id,
      expectedStatus: 404,
    });
  });

  it("should prevent unauthorized access", async () => {
    const normalUser = await prisma.user.create({
      data: {
        email: `user${Date.now()}@gmail.com`,
        password:
          "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC",
        name: "normal user",
        role: "USER",
      },
    });

    await tf.setup(normalUser.email, "123456");

    await tf.post({
      path: "/product",
      data: productData,
      expectedStatus: 403, // forbidden
    });

    await prisma.user.delete({ where: { email: normalUser.email } });
  });

  afterAll(async () => {
    await testCatchAsync(async () => {
      await prisma.user.delete({ where: { email: randomEmail } });
    });
  });
});
