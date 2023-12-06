import Elysia, { t } from 'elysia';
import { isAuthenticated } from '../plugins/authPlugin';
import { mapUserToUserDTO } from '../services/mappers';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { BadRequestError, NotFoundError } from '../types/CustomErrors';
import { errorHandler } from '../util/response';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { createNewUser } from '../services/userService';

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
      ({ set }) => {
        //TODO: implement
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

export const UserControllerExtra = new Elysia({ name: 'routes:user' }).group('/user', (app) => {
  app.use(isAuthenticated({ type: 'AdminOnly' })).post(
    '/create',
    async ({ body }) => {
      if (!body) {
        throw new BadRequestError('Could not create user');
      }
  
      const newUser = await createNewUser(body);
      return mapUserToUserDTO(newUser);
    },
    {
      error({ error, set }) {
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `Error getting activity: ${error.message}`);
        }
        return errorHandler(set.status, 500, `Error: ${error.message}`);
      },
      body: createUserDTO,
      response: {
        200: getUserDTO,
        400: BadRequestDTO,
        500: InternalServerErrorDTO,
      },
      detail: {
        summary: 'Create a new user account',
        tags: ['User'],
        security: [{ AccessToken: [] }],
      },
    }
  );
  
  return app;
});

 