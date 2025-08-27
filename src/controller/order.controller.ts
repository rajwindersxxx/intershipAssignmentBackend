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

    // // now create a new order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
      },
    });
    // now create array to push in database , price is added after checkout
    const createOrder = products.map((item) => ({
      productId: item.id,
      quantity: lookup.get(item.id),
      orderId: order.id,
    }));
    // finally create a order
    await prisma.orderItem.createMany({
      data: createOrder,
    });
    response(res, { orderId: order.id }, 201, {
      otherFields: { message: "Order added to pending" },
    });
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
    const { filterOptions, offset, limit } = new APIFeatures(req)
      .filter()
      .pagination()
      .sort();
    const data = await prisma.order.findMany({
      ...filterOptions,
      where: {
        ...filterOptions.where,
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
    const { filterOptions: filterOnly } = new APIFeatures(req).filter();

    const total = await prisma.order.count({
      ...filterOnly,
      where: {
        ...filterOnly.where,
        userId: req.user.id,
      },
    });
    response(res, data, 200, { otherFields: { limit, offset, total } });
  });
  static getAllOrders = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures(req)
      .filter()
      .pagination()
      .sort();
    const data = await prisma.order.findMany({
      ...filterOptions,
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
    const { filterOptions: filterOnly } = new APIFeatures(req).filter();

    const total = await prisma.order.count({
      ...filterOnly,
    });
    response(res, data, 200, { otherFields: { limit, offset, total } });
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
          new appError(
            "Order cannot be deleted after 24 hours ",
            400,
            "FORBIDDEN"
          )
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

  static getOrderItems = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures(req)
      .filter()
      .pagination()
      .sort()
      .limitFields();
    const data = await prisma.order.findMany({
      ...filterOptions,
      where: {
        ...filterOptions.where,
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
    const { filterOptions: filterOnly } = new APIFeatures(req).filter();

    const total = await prisma.order.count({
      ...filterOnly,
    });
    response(res, data, 200, { otherFields: { offset, limit, total } });
  });
  static checkoutOrder = catchAsync(async (req, res, next) => {
    //   verify owner first
    const order = await prisma.order.findMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });
    if (!order) return next(new appError("Order not found", 404, "NOT_FOUND"));
    //  1 fetch order items pending
    const OrderItems = await prisma.orderItem.findMany({
      where: {
        orderId: Number(req.params.id),
      },
    });
    const lookupOrder = new Map();
    OrderItems.forEach((item) => {
      lookupOrder.set(item.productId, item.quantity);
    });

    //  2 fetch stock items
    const StokeItems = await prisma.product.findMany({
      where: {
        id: {
          in: Array.from(lookupOrder.keys()),
        },
      },
      select: {
        price: true,
        inventoryCount: true,
        id: true,
        name: true,
      },
    });
    // hashmap for price
    const priceHashMap = new Map();
    StokeItems.forEach((item) => {
      priceHashMap.set(item.id, item.price);
    });
    //  3 compar if stock exists
    const itemsExist = StokeItems.map((item) => ({
      name: item.name,
      requestedQuantity: lookupOrder.get(item.id),
      availableQuantity: item.inventoryCount,
      itemExist: item.inventoryCount >= lookupOrder.get(item.id),
    }));
    const hasOutOfStock = itemsExist.some((item) => !item.itemExist);
    if (hasOutOfStock)
      return next(
        new appError("some items are out of stock", 400, "OUT_OF_STOCK", {
          items: itemsExist,
        })
      );
    //  5 calculate  totalAmount , items before checkout
    const totalAmount = StokeItems.reduce((sum, item) => {
      return sum + item.price * lookupOrder.get(item.id);
    }, 0);
    const totalItems = OrderItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
    //  4 deduct quantity
    const updatedOrder = await prisma.$transaction(async (prismaTx) => {
      // 1. Deduct quantity for each stock item
      const stockUpdates = StokeItems.map((item) =>
        prismaTx.product.update({
          where: { id: item.id },
          data: { inventoryCount: { decrement: lookupOrder.get(item.id) } },
        })
      );

      await Promise.all(stockUpdates);

      // 2. Update the order as PAID, totalAmount ,totalItems
      const order = await prismaTx.order.update({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
        data: {
          status: "PAID",
          totalAmount,
          totalItems,
        },
      });
      // finally create a order , update total amount
      OrderItems.forEach(
        async (item) =>
          await prisma.orderItem.updateManyAndReturn({
            where: { id: item.id },
            data: {
              price: priceHashMap.get(item.productId) * item.quantity,
            },
          })
      );
      return order;
    });

    // * update amount and prices storedItems , under development
    response(res, updatedOrder);
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
