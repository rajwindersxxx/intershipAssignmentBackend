import { Order, Product, User } from "../../generated/prisma";
import { prisma } from "../../src/utils/prismaClient";
import { testFactory } from "../testHelpers/testFactory";
import { testCatchAsync } from "../testHelpers/utils";
const tf = new testFactory();

describe("Order route tests", () => {
  const randomEmail = `test${Date.now()}@gmail.com`;
  let user: User;
  let admin: User;
  let products: Product[];
  let orderId: number;

  beforeAll(async () => {
    // Create normal user
    await testCatchAsync(async () => {
      user = await prisma.user.create({
        data: {
          email: randomEmail,
          password:
            "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC",
          name: "test user",
          role: "USER",
        },
      });
      admin = await prisma.user.create({
        data: {
          email: `admin${Date.now()}@gmail.com`,
          password:
            "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC",
          name: "admin user",
          role: "ADMIN",
        },
      });
      products = await prisma.product.findMany({ take: 5 });
    });

    // Login as normal user
    await tf.setup(user.email, "123456");
  });

  it("should fail placing order with empty items", async () => {
    await tf.post({
      path: "/order",
      data: { items: [] },
      expectedStatus: 400,
    });
  });

  it("should place a valid order", async () => {
    const items = products.map((p) => ({
      productId: p.id,
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    const res = await tf.post({
      path: "/order",
      data: { items },
      expectedStatus: 201,
    });
    orderId = res.data.orderId;
  });

  it("should get my orders", async () => {
    const res = await tf.get({ path: "/order/me", expectedStatus: 200 });
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("should checkout an order", async () => {
    const res = await tf.post({
      path: `/order/checkout/${orderId}`,
      expectedStatus: 200,
    });
    expect(res.data.status).toBe("PAID"); // depending on your API
  });

  it("should prevent non-admin dispatch", async () => {
    await tf.post({
      path: `/order/dispatch/${orderId}`,
      expectedStatus: 403, // normal user cannot dispatch
    });
  });

  it("admin should dispatch order", async () => {
    await tf.setup(admin.email, "123456");

    const res = await tf.post({
      path: `/order/dispatch/${orderId}`,
      expectedStatus: 200,
    });

    expect(res.data.status).toBe("DISPATCHED"); // depending on your API
  });

  it("should get all orders (admin)", async () => {
    const res = await tf.get({ path: "/order", expectedStatus: 200 });
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("should get order details by ID", async () => {
    await tf.setup(user.email, "123456");

    await tf.get({
      path: `/order/${orderId}`,
      expectedStatus: 200,
    });
  });

  it("should soft delete the order", async () => {
    await tf.delete({
      path: "/order",
      id: orderId,
      expectedStatus: 200,
    });
  });

  it("should fail deleting already deleted order", async () => {
    await tf.delete({
      path: "/order",
      id: orderId,
      expectedStatus: 404,
    });
  });

  afterAll(async () => {
    // cleanup users and orders
    await testCatchAsync(async () => {
      await prisma.user.delete({ where: { email: user.email } });
      await prisma.user.delete({ where: { email: admin.email } });
    });
  });
});
