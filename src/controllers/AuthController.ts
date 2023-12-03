import Elysia, { t } from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';
import { createNewUser, findUserByEmail } from '../services/userService';
import jwt from '@elysiajs/jwt';
import { mapUserToUserDTO } from '../services/mappers';
import { ForbiddenDTO } from '../types/ForbiddenDTO';
import { sendSignInEmail } from '../services/mailService';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { errorHandler } from '../util/response';

export const getUserDTO = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.Optional(t.Nullable(t.String())),
  phone: t.Optional(t.Nullable(t.String())),
  type: t.String(),
});

export const AuthController = new Elysia({ name: 'routes:auth' }).group('/auth', (app) =>
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

        await sendSignInEmail(existingUser.toObject(), token);
        return { message: `Check your email for magic link to login!` };
      },
      {
        error({ error, set }) {
          return errorHandler(set.status, 500, `Error getting all activities: ${error}`);
        },
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
);
