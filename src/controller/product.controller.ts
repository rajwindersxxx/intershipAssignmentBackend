import { APIFeatures } from "../utils/apiFeatures";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../utils/prismaClient";
import response from "../utils/response";

export class productController {
  static createProduct = catchAsync(async (req, res, _next) => {
    const input = { ...req.body, userId: req.user.id };
    const data = await prisma.product.create({
      data: input,
    });
    response(res, data, 201);
  });
  static updateProduct = catchAsync(async (req, res, _next) => {
    const data = await prisma.product.update({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: req.body,
    });
    response(res, data);
  });
  static deleteProduct = catchAsync(async (req, res, _next) => {
    await prisma.product.update({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: {
        active: false,
      },
    });
    response(res, null, 204);
  });
  static getAllProducts = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures<
      typeof prisma.product.findMany
    >(req.query as Record<string, string>)
      .filter()
      .limitFields()
      .pagination()
      .sort()
      .activeOnly();
    const data = await prisma.product.findMany({
      ...filterOptions,
      take: limit,
      skip: offset,
    });
    const { filterOptions: filterOnly } = new APIFeatures<
      typeof prisma.product.findMany
    >(req.query as Record<string, string>).filter();

    const total = await prisma.product.count({
      ...filterOnly,
    });
    response(res, data, 200, { otherFields: { limit, offset, total } });
  });
  static getProductDetails = catchAsync(async (req, res, _next) => {
    const data = await prisma.product.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    response(res, data);
  });
}
