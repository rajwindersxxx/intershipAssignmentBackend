import express from "express";
import { orderController } from "../controller/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { createOrder } from "../zod/order.zod";
import { params } from "../zod/genetic.zod";
const orderRoute = express();
orderRoute.use(authMiddleware.protectedRoute);
orderRoute
  .route("/")
  .post(validationMiddleware(createOrder), orderController.createOrder);
  
orderRoute.route("/me").get(orderController.getMyAllOrders);

orderRoute
  .route("/:id")
  .delete(validationMiddleware(params), orderController.deleteOrder);
export default orderRoute;
