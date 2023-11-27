import Elysia from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';

export const authRoute = (app: Elysia) =>
  app.group('/auth', (app) => {
    // The endpoint for signing in and signing up
    app.get('/signin', () => {
      return 'Signed in!';
    });

    // require authroization
    app.use(isAuthenticated).get('/account', ({ store, user }) => {
      return `My Account! ${JSON.stringify(user)}`;
    });
    return app;
  });
