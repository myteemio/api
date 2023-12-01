import { Elysia, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import {
  createNewActivity,
  findActivityById,
  findActivityByUrl,
  getAllActivities,
  makeUrlSafe,
} from '../services/activityService';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { mapActivityToActivityDTO } from '../services/mappers';

export const GetActivityDTO = t.Object({
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

export const createActivityDTO = t.Omit(GetActivityDTO, ['id']);

export const activitiesRoute = (app: Elysia) =>
  app.group('/activities', (app) => {
    // /activites
    app.post(
      '/',
      async ({ body, set }) => {
        if (body) {
          try {
            // Set the URL to something unique and safe
            body.url = makeUrlSafe(`${body.name}-${Date.now()}`);
            
            // Create the new activity
            const newActivity = await createNewActivity(body);

            return mapActivityToActivityDTO(newActivity);
          } catch (error) {
            set.status = 400;
            return {
              message: `Bad request: ${error}`,
              error_code: 'badrequest',
            };
          }
        }
      },
      {
        body: createActivityDTO,
        response: {
          201: t.Object({
            id: t.String({ default: 'ID of created activity' }),
          }),
          400: BadRequestDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Create a new activity',
          tags: ['Activities'],
        },
      }
    );

    app.get(
      '/',
      async ({ set }) => {
        const activities = await getAllActivities();
        if (activities) {
          set.status = 200;
          return {
            activities: activities.map((activity) =>
              mapActivityToActivityDTO(activity)
            ),
          };
        }
        set.status = 500;
        return {
          message: `Could not get activities due to server error`,
          error_code: 'internalservererror',
        };
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
        // Find by id
        const activityById = await findActivityById(idorurl);

        if (activityById) {
          return {
            id: activityById.id,
            url: activityById.url,
            name: activityById.name,
            description: activityById.description,
            image: activityById.image,
            price: activityById.price,
            persons: activityById.persons,
            category: activityById.category,
            address: activityById.address,
            referralLink: activityById.referralLink,
            location: activityById.location,
            estimatedHours: activityById.estimatedHours,
          };
        }

        const activityByUrl = await findActivityByUrl(idorurl);

        if (activityByUrl) {
          return {
            id: activityByUrl.id,
            url: activityByUrl.url,
            name: activityByUrl.name,
            description: activityByUrl.description,
            image: activityByUrl.image,
            price: activityByUrl.price,
            persons: activityByUrl.persons,
            category: activityByUrl.category,
            address: activityByUrl.address,
            referralLink: activityByUrl.referralLink,
            location: activityByUrl.location,
            estimatedHours: activityByUrl.estimatedHours,
          };
        }

        set.status = 404;
        return { message: 'Not found', error_code: 'notfound' };
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
    return app;
  });
