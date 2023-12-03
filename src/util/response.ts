

const errorResponseMap = new Map<Number, [string, string]>([
  [400, ['Bad Request', 'badreuest']],
  [401, ['Unauthorized', 'unauthorized']],
  [403, ['Forbidden', 'forbidden']],
  [404, ['Not Found', 'notfound']],
  [500, ['Internal Server Error', 'internalservererror']],
]);

export function errorHandler(
  statusCode: number,
  errorCode?: string,
  message?: string
): { message: string; errorCode: string } {
  if (statusCode && errorCode && message) {
    return {
      message: message,
      errorCode: errorResponseMap.get(statusCode)?.[1] || 'Error',
    };
  }


  if (statusCode && message) {
    return {
      message: message,
      errorCode: errorResponseMap.get(statusCode)?.[1] || 'Error',
    };
  }

  return {
    message: errorResponseMap.get(statusCode)?.[0] || 'Error',
    errorCode: errorResponseMap.get(statusCode)?.[1] || 'Error',
  };
}
