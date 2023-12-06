import Elysia from 'elysia';
import { BadRequestError } from '../types/CustomErrors';
import { createNewUser } from '../services/userService';
import { mapUserToUserDTO } from '../services/mappers';
import { errorHandler } from '../util/response';
import { createUserDTO, getUserDTO } from './UserController';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { isAuthenticated } from '../plugins/authPlugin';

export const AdminController = new Elysia({
  name: 'routes:admin',
}).group('/admin', (app) => {
  app.use(isAuthenticated({ type: 'AdminOnly' }));

  app.post(
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
        tags: ['Admin'],
        security: [{ AccessToken: [] }],
      },
    }
  );
  return app;
});
