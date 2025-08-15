import { appError } from "../../../src/utils/appError";

describe('appError', () => {
  it('should assign all properties correctly', () => {
    const data = { extra: 'info' };
    const err = new appError('Not Found', 404, 'NOT_FOUND', data);

    expect(err.message).toBe('Not Found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
    expect(err.data).toEqual(data);
    expect(err.stack).toBeDefined();
  });

  it('should default code to UNKNOWN', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = new appError('Server Error', 500, undefined as any);
    expect(err.code).toBe('UNKNOWN');
    expect(err.status).toBe('error');
  });

  it('should mark 4xx errors as fail and others as error', () => {
    const clientErr = new appError('Bad Request', 400, 'BAD_REQ');
    const serverErr = new appError('Internal', 500, 'INT_ERR');
    expect(clientErr.status).toBe('fail');
    expect(serverErr.status).toBe('error');
  });
});
