import { Response } from "express";
import { deepStrip } from "./utils";
/**
 * Quick JSON response helper function for Express.
 *
 * @export
 * @param {Response} res - Express response object.
 * @param {object | null} data - The data to send in the response body.
 * @param {number} [statusCode=200] - HTTP status code (default: 200).
 * @param {Object} [options={}] - Additional response options.
 * @param {object} [options.otherFields] - Extra fields to include in the response (e.g., pagination data).
 * @param {string[]} [options.hideFields] - Keys to exclude from the response object (e.g., 'password', 'active').
 */

export function response(
  res: Response,
  data: object | null,
  statusCode: number = 200,
  options: { otherFields?: object; hideFields?: string[] } = {}
) {
  let cleanData;
  if (data)
    cleanData = deepStrip(data, [
      "active",
      "password",
      ...(options.hideFields ?? []),
    ]);
  else cleanData = null;
  res.status(statusCode).json({
    status: "success",
    ...{ ...options.otherFields },
    data: cleanData,
    timestamp: new Date().toISOString(),
  });
}

export default response;


