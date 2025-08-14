import { differenceInHours } from "date-fns";
import { APIFeatures } from "../utils/apiFeatures";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../utils/prismaClient";
import response from "../utils/response";
import { appError } from "../utils/appError";

export class orderController {
  static createOrder = catchAsync(async (req, res, _next) => {
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
    const createOrderItems = await prisma.orderItem.createMany({
      data: createOrder,
    });
    response(res, createOrderItems, 201, { otherFields: { totalAmount } });
  });
  static getOrderItemsByProduct = catchAsync(async (req, res, _next) => {
    const data = await prisma.orderItem.findMany({
      where: {
        productId: Number(req.params.id),
      },
    });
    response(res, data);
  });
  static getMyOrderedItems = catchAsync(async (req, res, _next) => {
    const data = await prisma.orderItem.findMany({
      where: {
        orderId: Number(req.params.id),
      },
    });
    response(res, data);
  });
  static getMyAllOrders = catchAsync(async (req, res, _next) => {
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
        id: req.user.id,
      },
      skip: offset,
      take: limit,
    });
    response(res, data);
  });
  static deleteOrder = catchAsync(async (req, res, _next) => {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });
    const hoursSinceCreation = differenceInHours(new Date(), order.createdAt);
    if (hoursSinceCreation > 24)
      return new appError("Order cannot be deleted after 24 hours ", 400);
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
}
