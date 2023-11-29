import Elysia, { t } from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';
import { createNewUser, findUserByEmail } from '../services/userService';
import jwt from '@elysiajs/jwt';

export const authRoute = new Elysia({ name: 'routes:auth' }).group('/auth', (app) =>
  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '30d',
      })
    )
    .post(
      '/signin',
      async ({ body, jwt }) => {
        // SET THIS UP TO SEND EMAIL WITH CODE

        const existingUser = await findUserByEmail(body.email);

        if (!existingUser) {
          const newUser = await createNewUser({
            name: 'Mikkel Bech',
            type: 'user',
            email: body.email,
            phone: '+45 21775413',
          });
          return newUser;
        }

        const token = await jwt.sign(existingUser.toObject());

        return `Signed in! AccessToken: ${token}`;
      },
      {
        body: t.Object({ email: t.String() }),
        detail: {
          summary: 'Sign in using email',
          tags: ['Auth'],
        },
      }
    )
    .use(isAuthenticated({ type: 'All' }))
    .get(
      '/account',
      ({ store, user }) => {
        return `My Account! ${JSON.stringify(user)}`;
      },
      {
        detail: {
          summary: 'View info on the currently logged in account',
          tags: ['Auth'],
          security: [{ AccessToken: [] }],
        },
      }
    )
);
