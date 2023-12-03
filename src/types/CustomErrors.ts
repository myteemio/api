export interface CustomErrors extends Error {
  statusCode: number;
  errorCode: string;
}

export class NotFoundError extends Error implements CustomErrors {
  statusCode = 401;
  errorCode = 'unauthorized';
  constructor(public message: string, errorCode?: string) {
    super(message);
    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}

export class ForbiddenError extends Error implements CustomErrors {
  statusCode = 403;
  errorCode = 'forbidden';
  constructor(public message: string, errorCode?: string) {
    super(message);
    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}

export class BadRequestError extends Error implements CustomErrors {
  statusCode = 400;
  errorCode = 'badrequest';
  constructor(public message: string, errorCode?: string) {
    super(message);
    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}

export class UnauthorizedError extends Error implements CustomErrors {
  statusCode = 401;
  errorCode = 'unauthorized';
  constructor(public message: string, errorCode?: string) {
    super(message);
    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}

export class InternalServerError extends Error implements CustomErrors {
  statusCode = 500;
  errorCode = 'internalservererror';
  constructor(public message: string, errorCode?: string) {
    super(message);
    if (errorCode) {
      this.errorCode = errorCode;
    }
  }
}
