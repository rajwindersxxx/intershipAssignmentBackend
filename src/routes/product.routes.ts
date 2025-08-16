import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { productController } from "../controller/product.controller";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { createProduct, updateProduct } from "../zod/products.zod";
import { params } from "../zod/genetic.zod";
import {
  processImagesMiddleware,
  upload,
} from "../middleware/processImageUpload.middleware";
const productRouter = express();
productRouter.get("/categories", productController.getProductCategories);
productRouter.get("/", productController.getAllProducts);
productRouter.get("/:id", productController.getProductDetails);

productRouter.use(
  authMiddleware.protectedRoute,
  authMiddleware.restrictRoute("ADMIN")
);

productRouter
  .route("/")
  .post(
    upload.array("images", 5),
    processImagesMiddleware,
    validationMiddleware(createProduct),
    productController.createProduct
  );
productRouter
  .route("/:id")
  .patch(
    upload.array("images", 5),
    processImagesMiddleware,
    validationMiddleware(updateProduct),
    productController.updateProduct
  )
  .delete(validationMiddleware(params), productController.deleteProduct);
export default productRouter;
