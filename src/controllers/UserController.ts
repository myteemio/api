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

export const UserController = new Elysia({ name: 'routes:user' }).group('/user', (app) =>
  app
    .use(isAuthenticated({ type: 'UserOnly' }))
    .get(
      '/myteemios',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        detail: {
          summary: "Show a list of ID's of all the Teemios you have created",
          tags: ['User'],
          security: [{ AccessToken: [] }],
        },
      }
    )
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
          tags: ['User'],
          security: [{ AccessToken: [] }],
        },
      }
    )
);
