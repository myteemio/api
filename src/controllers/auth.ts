import Elysia from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';

export const authRoute = new Elysia({ name: 'routes:auth' }).group('/auth', (app) => {
  // The endpoint for signing in and signing up
  app.post(
    '/signin',
    () => {
      return 'Signed in!';
    },
    {
      detail: {
        summary: 'Sign in using email',
        tags: ['Auth'],
      },
    }
  );

  // require authroization
  app.use(isAuthenticated).get(
    '/account',
    ({ store, user }) => {
      return `My Account! ${JSON.stringify(user)}`;
    },
    {
      detail: {
        summary: 'View info on the currently logged in account',
        tags: ['Auth'],
      },
    }
  );
  return app;
});
