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
        active: true,
      },
      data: {
        active: false,
      },
    });
    response(res, null, 204);
  });
  static getAllProducts = catchAsync(async (req, res, _next) => {
    const { filterOptions, offset, limit } = new APIFeatures(req)
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
    const { filterOptions: filterOnly } = new APIFeatures(req).filter();

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
  static getProductCategories = catchAsync(async (req, res, _next) => {
    // * Might slow for large db ,
    const categories = await prisma.product.findMany({
      where: {
        active: true,
      },
      select: { category: true },
      distinct: ["category"],
    });
    const categoryList = categories.map((c) => c.category);
    response(res, categoryList);
  });
  static search = catchAsync(async (req, res, _next) => {
    // sport search feature search(by name or description)
    const { maxPrice, minPrice } = req.query;
    let advanceFilter;
    if (minPrice && maxPrice) {
      advanceFilter = {
        price: {
          lt: Number(maxPrice),
          gt: Number(minPrice),
        },
      };
    }
    const { filterOptions, offset, limit } = new APIFeatures(req, {
      ignore: ["maxPrice", "minPrice"],
    })
      .filter()
      .limitFields()
      .pagination()
      .sort()
      .activeOnly();
    const customFilter = {
      ...filterOptions,
      where: { ...filterOptions.where, ...(advanceFilter ?? {}) },
    };
    const data = await prisma.product.findMany(customFilter);
    const total = await prisma.product.count({
      where: filterOptions.where,
    });
    response(res, data, 200, { otherFields: { limit, offset, total } });
  });
}
