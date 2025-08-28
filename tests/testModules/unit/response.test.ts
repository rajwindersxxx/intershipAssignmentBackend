import { Response } from "express";
import response from "../../../src/utils/response";
import { describe, expect, it, vi } from "vitest";

describe("response utility", () => {
  function createMockResponse(): Response {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnThis();
    res.json = vi.fn().mockReturnThis();
    return res as Response;
  }

  it("should send data with stripped fields", () => {
    const res = createMockResponse();

    const data = { id: 1, password: "secret", active: true, name: "John" };

    response(res, data);

    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonArg.status).toBe("success");
    expect(jsonArg.data.password).toBeUndefined();
    expect(jsonArg.data.active).toBeUndefined();
    expect(jsonArg.data.name).toBe("John");
    expect(jsonArg.timestamp).toBeDefined();
  });

  it("should include otherFields if provided", () => {
    const res = createMockResponse();

    response(res, { id: 1 }, 201, { otherFields: { page: 1 } });

    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonArg.page).toBe(1);
    expect(jsonArg.status).toBe("success");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should handle null data", () => {
    const res = createMockResponse();

    response(res, null);

    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonArg.data).toBeNull();
    expect(jsonArg.status).toBe("success");
  });

  it("should hide additional fields if hideFields provided", () => {
    const res = createMockResponse();

    const data = { id: 1, secret: "hideMe", name: "Alice" };
    response(res, data, 200, { hideFields: ["secret"] });

    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonArg.data.secret).toBeUndefined();
    expect(jsonArg.data.name).toBe("Alice");
  });
});
