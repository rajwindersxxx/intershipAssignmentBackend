import express from "express";
import { orderController } from "../controller/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { createOrder } from "../zod/order.zod";
import { params } from "../zod/genetic.zod";
const orderRoute = express();
// All routes require login
orderRoute.use(authMiddleware.protectedRoute);

// ADMIN routes
orderRoute.use(authMiddleware.restrictRoute("ADMIN"));
orderRoute.post(
  "/:id/dispatch",
  validationMiddleware(params),
  orderController.dispatchOrder
);
orderRoute.get("/", orderController.getAllOrders);
orderRoute.get("/item", orderController.getOrderItems);

// USER routes
orderRoute.use(authMiddleware.restrictRoute("USER"));
orderRoute.post(
  "/",
  validationMiddleware(createOrder),
  orderController.placeOrder
);
orderRoute.get("/me", orderController.getMyOrders);
orderRoute.delete(
  "/:id",
  validationMiddleware(params),
  orderController.deleteOrder
);
orderRoute.post(
  "/:id/checkout",
  validationMiddleware(params),
  orderController.checkoutOrder
);
export default orderRoute;
