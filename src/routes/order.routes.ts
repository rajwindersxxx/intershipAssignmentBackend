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
orderRoute.post(
  "/dispatch/:id",
  authMiddleware.restrictRoute("ADMIN"),
  validationMiddleware(params),
  orderController.dispatchOrder
);
orderRoute.get(
  "/",
  authMiddleware.restrictRoute("ADMIN"),
  orderController.getAllOrders
);
orderRoute.get(
  "/item",
  authMiddleware.restrictRoute("ADMIN"),
  orderController.getOrderItems
);

// USER routes
orderRoute.post(
  "/",
  authMiddleware.restrictRoute("USER"),
  validationMiddleware(createOrder),
  orderController.placeOrder
);
orderRoute.get(
  "/me",
  authMiddleware.restrictRoute("USER"),
  orderController.getMyOrders
);

orderRoute
  .route("/:id")
  .delete(
    authMiddleware.restrictRoute("USER"),
    validationMiddleware(params),
    orderController.deleteOrder
  )
  .get(
    authMiddleware.restrictRoute("USER"),
    validationMiddleware(params),
    orderController.getMyOrderedItems
  );
orderRoute.post(
  "/checkout/:id",
  authMiddleware.restrictRoute("USER"),
  validationMiddleware(params),
  orderController.checkoutOrder
);

export default orderRoute;
