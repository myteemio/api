import { Elysia, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { isAuthenticated } from '../plugins/authPlugin';
import {
  createNewActivity,
  findActivityById,
  findActivityByUrl,
  getAllActivities,
} from '../services/activityService';
import { BadRequestDTO } from '../types/BadRequestDTO';
import mongoose from 'mongoose';
import { mapActivityToActivityDTO } from '../services/mappers';
import { errorHandler } from '../util/response';
import { NotFoundError } from '../types/CustomErrors';
import { makeUrlSafe } from '../util/helperFunctions';

export const ActivityDTO = t.Object({
  id: t.String(),
  name: t.String(),
  url: t.String(),
  description: t.String(),
  image: t.String(),
  price: t.Number(),
  persons: t.Number(),
  category: t.Array(t.String()),
  address: t.Object({
    address1: t.String(),
    address2: t.Optional(t.Nullable(t.String())),
    zipcode: t.String(),
    city: t.String(),
    country: t.String(),
  }),
  referralLink: t.String(),
  location: t.Object({
    lat: t.Number(),
    long: t.Number(),
  }),
  estimatedHours: t.Number(),
});

const getActivityDTO = ActivityDTO;

const postActivityDTO = t.Omit(ActivityDTO, ['id']);

export const ActivityController = new Elysia({
  name: 'routes:activities',
}).group('/activities', (app) => {
  // /activites
  app.get(
    '/',
    async ({ set }) => {
      const allactivities = await getAllActivities();
      return {
        activities: allactivities.map((x) => mapActivityToActivityDTO(x)),
      };
    },
    {
      error({ error, set }) {
        return errorHandler(set.status, 500, error.message);
      },
      response: {
        200: t.Object({ activities: t.Array(getActivityDTO) }),
        500: InternalServerErrorDTO,
      },
      detail: {
        summary: 'Returns a list of all activities',
        tags: ['Activities'],
      },
    }
  );

  // /activities/:idorurl
  app.get(
    '/:idorurl',
    async ({ params: { idorurl }, set }) => {
      // Check if ID is valid
      if (mongoose.isValidObjectId(idorurl)) {
        // Find by id
        const activityById = await findActivityById(idorurl);

        if (activityById) {
          return mapActivityToActivityDTO(activityById);
        }

        throw new NotFoundError('Activity was not found!');
      } else {
        const activityByUrl = await findActivityByUrl(idorurl);

        if (activityByUrl) {
          return mapActivityToActivityDTO(activityByUrl);
        }
        throw new NotFoundError('Activity was not found!');
      }
    },
    {
      error({ error, set }) {
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error.message}`);
        }
        return errorHandler(
          set.status,
          500,
          `Error getting activity: ${error.message}`
        );
      },
      params: t.Object({
        idorurl: t.String(),
      }),
      response: {
        200: getActivityDTO,
        404: NotFoundDTO,
        500: InternalServerErrorDTO,
      },
      detail: {
        summary: 'Returns a single activity with :id',
        tags: ['Activities'],
      },
    }
  );

  app.use(isAuthenticated({ type: 'AdminOnly' })).post(
    '/',
    async ({ body }) => {
      // Set the URL to something unique and safe
      body.url = makeUrlSafe(`${body.name}-${Date.now()}`);

      // Create the new activity
      const newActivity = await createNewActivity(body);

      return mapActivityToActivityDTO(newActivity);
    },
    {
      error({ error, set }) {
        return errorHandler(
          set.status,
          500,
          `Error getting activity: ${error.message}`
        );
      },
      body: postActivityDTO,
      response: {
        200: getActivityDTO,
        400: BadRequestDTO,
        500: InternalServerErrorDTO,
      },
      detail: {
        summary: 'Create a new activity',
        tags: ['Activities'],
        security: [{ AccessToken: [] }],
      },
    }
  );

  return app;
});
