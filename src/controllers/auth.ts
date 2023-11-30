import Elysia, { t } from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';
import { createNewUser, findUserByEmail } from '../services/userService';
import jwt from '@elysiajs/jwt';
import { mapUserToUserDTO } from '../services/mappers';
import { ForbiddenDTO } from '../types/ForbiddenDTO';
import { sendSignInEmail } from '../services/mailService';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';

export const getUserDTO = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.Optional(t.Nullable(t.String())),
  phone: t.Optional(t.Nullable(t.String())),
  type: t.String(),
});

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
      async ({ body, jwt, set }) => {
        const existingUser = await findUserByEmail(body.email);

        if (!existingUser) {
          const newUser = await createNewUser({
            name: 'Mikkel Bech',
            type: 'user',
            email: body.email,
            phone: '+45 21775413',
          });
          set.status = 201;
          return { message: 'User created!', user: mapUserToUserDTO(newUser) };
        }

        // Send the token to the mail for magic login
        const token = await jwt.sign({ id: existingUser.id });

        try {
          await sendSignInEmail(existingUser.toObject(), token);
          return { message: `Check your email for magic link to login!` };
        } catch (err: any) {
          console.error(err);
          set.status = 500;
          return { message: 'Error sending email', error_code: 'internalservererror' };
        }
      },
      {
        response: {
          200: t.Object({ message: t.String() }),
          201: t.Object({ message: t.String(), user: getUserDTO }),
          403: ForbiddenDTO,
          500: InternalServerErrorDTO,
        },
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
      ({ user, set }) => {
        if (!user) {
          set.status = 404;
          return { message: 'User not found!', error_code: 'nouseronaccount' };
        }

        return mapUserToUserDTO(user);
      },
      {
        response: {
          200: getUserDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'View info on the currently logged in account',
          tags: ['Auth'],
          security: [{ AccessToken: [] }],
        },
      }
    )
);
