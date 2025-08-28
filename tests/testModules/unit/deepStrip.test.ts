import { describe, expect, it } from "vitest";
import { deepStrip } from "../../../src/utils/utils";

describe('deepStrip', () => {
  it('should remove keys from a flat object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = deepStrip(obj, ['b', 'c']);
    expect(result).toEqual({ a: 1 });
  });

  it('should remove keys from nested objects', () => {
    const obj = { a: 1, b: { c: 2, d: 3 }, e: 4 };
    const result = deepStrip(obj, ['c', 'e']);
    expect(result).toEqual({ a: 1, b: { d: 3 } });
  });

  it('should remove keys from arrays of objects', () => {
    const obj = { items: [{ a: 1, b: 2 }, { a: 3, b: 4 }] };
    const result = deepStrip(obj, ['b']);
    expect(result).toEqual({ items: [{ a: 1 }, { a: 3 }] });
  });

  // it('should leave Date objects untouched', () => {
  //   const date = new Date();
  //   const obj = { createdAt: date, a: 1 };
  //   const result = deepStrip(obj, ['a']);
  //   expect(result.createdAt).toBe(date); // same reference
  // });

  // it('should handle primitives and return them as-is', () => {
  //   expect(deepStrip(42, ['a'])).toBe(42);
  //   expect(deepStrip('hello', ['a'])).toBe('hello');
  //   expect(deepStrip(true, ['a'])).toBe(true);
  // });

  it('should handle empty keyToRemove array and return the same object', () => {
    const obj = { a: 1, b: 2 };
    const result = deepStrip(obj);
    expect(result).toEqual(obj);
  });

  it('should deeply remove multiple keys', () => {
    const obj = {
      a: 1,
      b: { c: 2, d: { e: 3, f: 4 } },
      g: [{ h: 5, i: 6 }, { h: 7, i: 8 }],
    };
    const result = deepStrip(obj, ['b', 'i']);
    expect(result).toEqual({
      a: 1,
      g: [{ h: 5 }, { h: 7 }],
    });
  });
});
