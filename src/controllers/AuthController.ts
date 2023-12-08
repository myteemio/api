import Elysia, { t } from 'elysia';
import { findUserByEmail } from '../services/userService';
import jwt from '@elysiajs/jwt';
import { ForbiddenDTO } from '../types/ForbiddenDTO';
import { sendSignInEmail } from '../services/mailService';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { errorHandler } from '../util/response';
import { NotFoundError } from '../types/CustomErrors';
import { getUserDTO } from './UserController';

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
      async ({ body, jwt }) => {
        const existingUser = await findUserByEmail(body.email);

        if (!existingUser) {
          // If there is no user, then the user has not created any teemios.
          throw new NotFoundError('The user was not found.');
        }

        // Send the token to the mail for magic login
        const token = await jwt.sign({ id: existingUser.id });

        await sendSignInEmail(existingUser.toObject(), token);
        return { message: `Check your email for magic link to login!` };
      },
      {
        error({ error, set }) {
          if (error instanceof NotFoundError) {
            return errorHandler(set.status, error.statusCode, `${error.message}`);
          }
          return errorHandler(set.status, 500, `Error signing in: ${error.message}`);
        },
        response: {
          200: t.Object({ message: t.String() }),
          201: t.Object({ message: t.String(), user: getUserDTO }),
          403: ForbiddenDTO,
          500: InternalServerErrorDTO,
        },
        body: t.Object({ email: t.String() }),
        detail: {
          summary: 'Sign in using email. User must have created at least one teemio to be able to signin.',
          tags: ['Auth'],
        },
      }
    )
);
