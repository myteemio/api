import Elysia, { t } from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';
import { mapMyTeemioToMyTeemioDTO, mapUserToUserDTO } from '../services/mappers';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { NotFoundError } from '../types/CustomErrors';
import { errorHandler } from '../util/response';
import { MyTeemioDTO } from './MyTeemioController';
import { getTeemiosByEmail } from '../services/myTeemioService';

export const getUserDTO = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.Optional(t.Nullable(t.String())),
  phone: t.Optional(t.Nullable(t.String())),
  type: t.String(),
});

export const createUserDTO = t.Omit(getUserDTO, ['id']);

export const UserController = new Elysia({ name: 'routes:user' }).group('/user', (app) => {
  app
    .use(isAuthenticated({ type: 'UserOnly' }))
    .get(
      '/myteemios',
      async ({ set, user }) => {
        if (!user || !user.email) {
          throw new NotFoundError('User not found!');
        }

        const teemios = await getTeemiosByEmail(user.email);

        return teemios.map((teemio) => mapMyTeemioToMyTeemioDTO(teemio));

        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        response: {
          200: t.Array(MyTeemioDTO),
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: "Show a list of ID's of all the Teemios you have created",
          tags: ['User'],
          security: [{ AccessToken: [] }],
        },
      }
    )
    .get(
      '/account',
      ({ user }) => {
        if (!user) {
          throw new NotFoundError('User not found!');
        }

        return mapUserToUserDTO(user);
      },
      {
        error({ error, set }) {
          if (error instanceof NotFoundError) {
            return errorHandler(set.status, error.statusCode, `Error getting activity: ${error.message}`);
          }
          return errorHandler(set.status, 500, `Error: ${error.message}`);
        },
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
    );
  return app;
});
