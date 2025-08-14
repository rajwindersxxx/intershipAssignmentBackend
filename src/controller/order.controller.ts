import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../utils/prismaClient";
import response from "../utils/response";

export class orderController {
  static createOrder = catchAsync(async (req, res, next) => {
    const input: { productId: number; quantity: number }[] = req.body.items;
    // fetch all products with give nds
    const productsIds = input.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productsIds },
      },
    });
    console.log(products)
    // // create an order in db
    // const order = await prisma.order.create({
    //   data: {
    //     userId: req.user.id,
    //     total: 0, //* temp done , i calculate later
    //   },
    // });

    response(res, null);
  });
}
