import { Order, Product, User } from "../generated/prisma";
import { prisma } from "../src/utils/prismaClient";
import { faker } from "@faker-js/faker";

// * run main script
export class seedData {
  static async seedFakeData() {
    console.log("seeding users...");
    const users = await prisma.user.createManyAndReturn({
      data: getUsers(),
    });
    console.log("seeding products..... ");
    const products = await prisma.product.createManyAndReturn({
      data: getProducts(users),
    });
    console.log("seeding orders.... ");
    const orders = await prisma.order.createManyAndReturn({
      data: getUsersOrder(users, products),
    });
    console.log("seeding orders items...");
    await prisma.orderItem.createManyAndReturn({
      data: getOrderedItems(orders, products),
    });
    console.log("NOTE: totalAmount and totalItems might be incorrect ");
  }
  static async clearData() {
    console.log("clearing  all data .... ");
    try {
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      await prisma.product.deleteMany();
      await prisma.user.deleteMany()
       console.log("all data cleared ")
    } catch (error) {
        console.log(error)
    }
  }
  static async createAdmin() {
    console.log("seeding admin only");
    await prisma.user.createMany({
      data: [
        {
          email: "admin@gmail.com",
          password:
            "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC",
          name: "admin",
        },
      ],
      skipDuplicates: true,
    });
  }
}
const args = process.argv.slice(2);
async function main() {
  if (args.includes("--clear")) {
    return seedData.clearData();
  }
  if (args.includes("--admin")) {
    return seedData.createAdmin();
  }
  await seedData.clearData();
  return seedData.seedFakeData();
}

// Helper function to create seed data
function getOrderedItems(orders: Order[], products: Product[]) {
  const productData = products.map((item) => ({
    id: item.id,
    price: item.price,
  }));

  const orderIds = orders.map((item) => item.id);
  const orderItems: {
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  }[] = [];

  for (let i = 0; i < 20; i++) {
    const orderId = orderIds[Math.floor(Math.random() * orderIds.length)];
    const product = productData[Math.floor(Math.random() * productData.length)];
    const quantity = Math.floor(Math.random() * 5) + 1; // 1–5 quantity
    const price = Number((product.price * quantity).toFixed(2));

    orderItems.push({
      orderId,
      productId: product.id,
      quantity,
      price,
    });
  }

  return orderItems;
}
function getUsersOrder(users: User[], products: Product[]) {
  const userIds = users
    .filter((item) => item.role === "USER")
    .map((item) => item.id);

  const productIds = products.map((item) => ({
    id: item.id,
    price: item.price,
  }));

  const orders: { userId: number; totalAmount: number; totalItems: number }[] =
    [];

  for (let i = 0; i < 20; i++) {
    const itemCount = Math.floor(Math.random() * 5) + 1; // 1–5 items per order
    let totalAmount = 0;
    let totalItems = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = productIds[Math.floor(Math.random() * productIds.length)];
      const quantity = Math.floor(Math.random() * 5) + 1; // 1–5 quantity

      totalAmount += product.price * quantity;
      totalItems += quantity;
    }

    const order = {
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems,
    };

    orders.push(order);
  }

  return orders;
}
function getProducts(users: User[]) {
  const userIds = users
    .filter((item) => item.role === "ADMIN")
    .map((item) => item.id);
  const products: {
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    inventoryCount: number;
    userId: number;
  }[] = [];
  for (let i = 0; i <= 20; i++) {
    const images: string[] = Array.from({ length: 5 }, () =>
      faker.image.urlLoremFlickr({ category: "product" })
    );
    const product = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
      category: faker.commerce.department(),
      images: images,
      inventoryCount: faker.number.int({ min: 0, max: 200 }),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
    };
    products.push(product);
  }
  return products;
}
function getUsers() {
  const password =
    "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC";
  const users: {
    email: string;
    password: string;
    name: string;
    role?: "ADMIN" | "USER";
  }[] = [{ email: "test@gmail.com", password, name: "admin", role: "ADMIN" }];
  const index = 10;
  for (let i = 0; i <= index; i++) {
    let user: {
      email: string;
      password: string;
      name: string;
      role?: "ADMIN" | "USER";
    };
    if (index < 2)
      user = {
        email: `${Math.floor(Math.random() * 1000)}${faker.internet.email()}`,
        name: faker.person.fullName(),
        password,
        role: "ADMIN",
      };
    else {
      user = {
        email: `${Math.floor(Math.random() * 1000)}${faker.internet.email()}`,
        name: faker.person.fullName(),
        password,
      };
    }
    users.push(user);
  }
  return users;
}
// main seed runner
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
