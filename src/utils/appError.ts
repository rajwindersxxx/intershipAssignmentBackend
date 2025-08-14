/**
 * this function follow catchAsync Pattern
 * catchAsync , globalHandler, and appError all work together
 * @export
 * @class appError
 * @extends {Error}
 */
export class appError extends Error {
  statusCode: number;
  status: string;
  code: string;
  isOperational: boolean;
  data?: object;
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    data?: object
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "UNKNOWN";
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.message = message;
    this.isOperational = true;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
