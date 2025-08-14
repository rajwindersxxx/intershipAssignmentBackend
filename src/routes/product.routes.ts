import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { productController } from "../controller/product.controller";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { createProduct, updateProduct } from "../zod/products.zod";
import { params } from "../zod/genetic.zod";
const productRouter = express();

productRouter.get("/", productController.getAllProducts);
productRouter.get("/:id", productController.getProductDetails)

productRouter.use(
  authMiddleware.protectedRoute,
  authMiddleware.restrictRoute("ADMIN")
);

productRouter
  .route("/")
  .post(validationMiddleware(createProduct), productController.createProduct);
productRouter
  .route("/:id")
  .patch(validationMiddleware(updateProduct), productController.updateProduct)
  .delete(validationMiddleware(params), productController.deleteProduct);
export default productRouter;
