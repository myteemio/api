import { Elysia, NotFoundError, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { isAuthenticated } from '../plugins/authPlugin';
import {
  createNewActivity,
  findActivityById,
  findActivityByUrl,
  getAllActivities,
  makeUrlSafe,
} from '../services/activityService';
import { BadRequestDTO } from '../types/BadRequestDTO';
import mongoose from 'mongoose';
import { mapActivityToActivityDTO } from '../services/mappers';

export const GetActivityDTO = t.Object({
  id: t.String(),
  url: t.String(),
  name: t.String(),
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

export const createActivityDTO = t.Omit(GetActivityDTO, ['id']);

export const activitiesRoute = new Elysia({ name: 'routes:activities' }).group('/activities', (app) => {
  // /activites
  app.get(
    '/',
    async () => {
      const allactivities = await getAllActivities();
      return { activities: allactivities.map((x) => mapActivityToActivityDTO(x)) };
    },
    {
      response: {
        200: t.Object({ activities: t.Array(GetActivityDTO) }),
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

        set.status = 404;
        return { message: 'Not found', error_code: 'notfound' };
      } else {
        const activityByUrl = await findActivityByUrl(idorurl);

        if (activityByUrl) {
          return mapActivityToActivityDTO(activityByUrl);
        }

        set.status = 404;
        return { message: 'Not found', error_code: 'notfound' };
      }
    },
    {
      params: t.Object({
        idorurl: t.String(),
      }),
      response: {
        200: GetActivityDTO,
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
      body: createActivityDTO,
      response: {
        200: GetActivityDTO,
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
