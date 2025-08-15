import { differenceInHours } from "date-fns";
import { APIFeatures } from "../utils/apiFeatures";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../utils/prismaClient";
import response from "../utils/response";
import { appError } from "../utils/appError";

export class orderController {
  static placeOrder = catchAsync(async (req, res, _next) => {
    const input: { productId: number; quantity: number }[] = req.body.items;
    // first build a lookup hashmap from input
    const lookup = new Map();
    input.forEach((item) => {
      lookup.set(item.productId, item.quantity);
    });
    // fetch all products with give Ids
    const products = await prisma.product.findMany({
      where: {
        id: { in: Array.from(lookup.keys()) },
      },
    });
    // calculate total amount
    const totalAmount = products.reduce((sum, item) => {
      return sum + item.price * lookup.get(item.id);
    }, 0);
    const totalItems = input.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
    // // now create a new order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        totalItems,
      },
    });
    // now create array to push in database
    const createOrder = products.map((item) => ({
      productId: item.id,
      quantity: lookup.get(item.id),
      price: item.price,
      orderId: order.id,
    }));
    // finally create a order
    await prisma.orderItem.createMany({
      data: createOrder,
    });
    response(res, { totalAmount, totalItems, orderId: order.id }, 201);
  });
  static getMyOrderedItems = catchAsync(async (req, res, _next) => {
    const data = await prisma.orderItem.findMany({
      where: {
        orderId: Number(req.params.id),
        order: {
          userId: req.user.id,
        },
      },
    });
    response(res, data);
  });
  static getMyOrders = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures<
      typeof prisma.order.findMany
    >(req.query as Record<string, string>)
      .filter()
      .pagination()
      .sort();
    const data = await prisma.order.findMany({
      ...filterOptions,
      where: {
        ...(filterOptions as unknown as { where: object }).where,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    });
    response(res, data);
  });
  static deleteOrder = catchAsync(async (req, res, next) => {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
        active: true,
      },
    });
    if (!order) return next(new appError("Order not found ", 404, "NOT_FOUND"));
    if (order) {
      const hoursSinceCreation = differenceInHours(new Date(), order.createdAt);
      if (hoursSinceCreation > 24)
        return next(
          new appError("Order cannot be deleted after 24 hours ", 400, "FORBIDDEN")
        );
    }
    await prisma.order.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        active: false,
      },
    });
    response(res, null);
  });
  static getAllOrders = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures<
      typeof prisma.order.findMany
    >(req.query as Record<string, string>)
      .filter()
      .pagination()
      .sort();
    const data = await prisma.order.findMany({
      ...filterOptions,
      skip: offset,
      take: limit,
    });
    const { filterOptions: filterOnly } = new APIFeatures<
      typeof prisma.order.findMany
    >(req.query as Record<string, string>).filter();

    const total = await prisma.order.count({ ...filterOnly });
    response(res, data, 200, { otherFields: { offset, limit, total } });
  });
  static getOrderItems = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures<
      typeof prisma.order.findMany
    >(req.query as Record<string, string>)
      .filter()
      .pagination()
      .sort()
      .limitFields();
    const data = await prisma.orderItem.findMany({
      ...filterOptions,
      include: {
        product: {
          select: {
            name: true,
            id: true,
            imageUrl: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });
    const { filterOptions: OnlyFilter } = new APIFeatures<
      typeof prisma.order.findMany
    >(req.query as Record<string, string>).filter();
    const total = await prisma.orderItem.count({
      ...OnlyFilter,
    });
    response(res, data, 200, { otherFields: { offset, limit, total } });
  });
  static checkoutOrder = catchAsync(async (req, res, _next) => {
    const data = await prisma.order.update({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: {
        status: "PAID",
      },
    });
    response(res, data);
  });
  static dispatchOrder = catchAsync(async (req, res, _next) => {
    const data = await prisma.order.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: "DISPATCHED",
      },
    });
    response(res, data);
  });
}
