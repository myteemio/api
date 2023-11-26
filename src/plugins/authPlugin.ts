import Elysia from 'elysia';

export const isAuthenticated = (app: Elysia) =>
  app.derive(async ({ cookie, request, set }) => {
    if (!request.headers.has('Authorization')) {
      set.status = 401;
      return 'Unauthorized';
    }

    const header = request.headers.get('Authorization');

    if (header && !header.includes('Bearer')) {
      set.status = 401;
      return 'Unauthorized';
    }

    const splittedHeader = header ? header?.split('Bearer') : [];

    if (splittedHeader.length !== 2) {
      set.status = 401;
      return 'Unauthorized';
    }

    const token = splittedHeader[1];

    if (token && token.trim().length <= 0) {
      set.status = 401;
      return 'Unauthorized';
    }

    // Decode the token and verify it
  });
