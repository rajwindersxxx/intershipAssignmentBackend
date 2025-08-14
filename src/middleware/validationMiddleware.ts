import { appError } from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { Schema, ZodError } from "zod";

export function validationMiddleware({
  bodySchema,
  paramsSchema,
  querySchema,
}: {
  bodySchema?: Schema;
  paramsSchema?: Schema;
  querySchema?: Schema;
}) {
  return catchAsync(async (req, res, next) => {
    if (bodySchema) {
      const result = bodySchema.safeParse(req.body);
      if (!result.success)
        return next(
          new appError(
            "Body validation failed",
            400,
            "VALIDATION_ERROR",
            formatZodErrors(result.error)
          )
        );
      req.body = result.data;
    }

    if (paramsSchema) {
      const result = paramsSchema.safeParse(req.params);
      if (!result.success)
        return next(
          new appError(
            "Params validation failed",
            400,
            "VALIDATION_ERROR",
            formatZodErrors(result.error)
          )
        );
      req.params = result.data;
    }

    if (querySchema) {
      const result = querySchema.safeParse(req.query);
      if (!result.success)
        return next(
          new appError(
            "Query validation failed",
            400,
            "VALIDATION_ERROR",
            formatZodErrors(result.error)
          )
        );
      req.query = result.data;
    }

    next();
  });
}
function formatZodErrors(zodError: ZodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
