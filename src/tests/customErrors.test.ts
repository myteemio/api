import { describe, expect, test } from 'bun:test';
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../types/CustomErrors';

describe('Custom Errors', () => {
  test('NotFoundError should set default properties', () => {
    const error = new NotFoundError('Not found');
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe('unauthorized');
  });

  test('NotFoundError should allow custom errorCode', () => {
    const error = new NotFoundError('Not found', 'custom_code');
    expect(error.errorCode).toBe('custom_code');
    expect(error.statusCode).toBe(401);
  });

  test('ForbiddenError should set default properties', () => {
    const error = new ForbiddenError('Forbidden access');
    expect(error.message).toBe('Forbidden access');
    expect(error.statusCode).toBe(403);
    expect(error.errorCode).toBe('forbidden');
  });

  test('ForbiddenError should allow custom errorCode', () => {
    const error = new ForbiddenError('Forbidden access', 'custom_forbidden_code');
    expect(error.errorCode).toBe('custom_forbidden_code');
  });

  test('BadRequestError should set default properties', () => {
    const error = new BadRequestError('Bad request');
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('badrequest');
  });

  test('BadRequestError should allow custom errorCode', () => {
    const error = new BadRequestError('Bad request', 'custom_badrequest_code');
    expect(error.errorCode).toBe('custom_badrequest_code');
  });

  test('UnauthorizedError should set default properties', () => {
    const error = new UnauthorizedError('Unauthorized access');
    expect(error.message).toBe('Unauthorized access');
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe('unauthorized');
  });

  test('UnauthorizedError should allow custom errorCode', () => {
    const error = new UnauthorizedError('Unauthorized access', 'custom_unauthorized_code');
    expect(error.errorCode).toBe('custom_unauthorized_code');
  });

  test('InternalServerError should set default properties', () => {
    const error = new InternalServerError('Internal server error');
    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(500);
    expect(error.errorCode).toBe('internalservererror');
  });

  test('InternalServerError should allow custom errorCode', () => {
    const error = new InternalServerError('Internal server error', 'custom_internal_code');
    expect(error.errorCode).toBe('custom_internal_code');
  });
});
