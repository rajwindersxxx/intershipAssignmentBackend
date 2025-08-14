import { Response } from "express";
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
/**
 * this recursive function used to remove files for nested object ,
 * found this function on internet
 * @param {object} obj
 * @param {string[]} [keyToRemove=[]]
 * @return {*}  {object}
 */
function deepStrip(obj: object, keyToRemove: string[] = []): object {
  if (obj instanceof Date) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepStrip(item, keyToRemove));
  } else if (obj && typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!keyToRemove.includes(key)) {
        newObj[key] = deepStrip(value, keyToRemove);
      }
    }
    return newObj;
  }
  return obj;
}
