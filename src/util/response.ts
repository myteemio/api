import { HTTPStatusName } from 'elysia/dist/utils';

const errorResponseMap = new Map<Number, [string, string]>([
  [400, ['Bad Request', 'badrequest']],
  [401, ['Unauthorized', 'unauthorized']],
  [403, ['Forbidden', 'forbidden']],
  [404, ['Not Found', 'notfound']],
  [500, ['Internal Server Error', 'internalservererror']],
]);

export function errorHandler(
  status: number | HTTPStatusName | undefined,
  statusCode: number,
  message?: string,
  errorCode?: string
): { message: string; error_code: string } {
  if (status) {
    status = statusCode;
  }

  if (statusCode && message && errorCode) {
    return {
      message: message,
      error_code: errorCode,
    };
  }

  if (statusCode && message) {
    return {
      message: message,
      error_code: errorResponseMap.get(statusCode)?.[1] || 'Error',
    };
  }

  return {
    message: errorResponseMap.get(statusCode)?.[0] || 'Error',
    error_code: errorResponseMap.get(statusCode)?.[1] || 'Error',
  };
}
