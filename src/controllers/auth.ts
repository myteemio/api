import Elysia from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';

export const authRoute = (app: Elysia) =>
  app.group('/auth', (app) => {
    // The endpoint for signing in and signing up
    app.get('/signin', () => {
      return 'Signed in!';
    });

    // require authroization
    app.use(isAuthenticated);
    // The endpoint for getting account information
    app.get('/account', () => {
      return 'My Account!';
    });
    return app;
  });
