// found this function on internet, typescript is too genetic
/**
 * this recursive function used to remove files for nested object ,
 * found this function on internet
 * @param {object} obj
 * @param {string[]} [keyToRemove=[]]
 * @return {*}  {object}
 */
export function deepStrip(obj: object, keyToRemove: string[] = []): object {
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
