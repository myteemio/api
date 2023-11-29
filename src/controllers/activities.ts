import { Elysia, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import {
  findActivityById,
  findActivityByUrl,
} from '../services/activityService';
import { Activity } from '../models/Activity';
import { BadRequestDTO } from '../types/BadRequestDTO';

const ActivityDTO = t.Object({
  url: t.String(),
  name: t.String(),
  description: t.String(),
  image: t.String(),
  pris: t.Number(),
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

export const activitiesRoute = (app: Elysia) =>
  app.group('/activities', (app) => {
    // /activites
    app.post(
      '/',
      ({ body, set }) => {
        if (body) {
          try {
            const newActivity = new Activity({
              url: `https://teemio.dk/activities/${body.name
                .replace(/\s+/g, '')
                .toLocaleLowerCase()}`,
              name: body.name,
              description: body.description,
              image: body.image,
              pris: body.pris,
              persons: body.persons,
              category: body.category,
              address: body.address,
              referralLink: body.referralLink,
              location: body.location,
              estimatedHours: body.estimatedHours,
            });

            newActivity.save();
            set.status = 201;
            return { id: newActivity._id.toString() };
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
        body: ActivityDTO,
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
      () => {
        return { activities: [] };
      },
      {
        response: {
          200: t.Object({ activities: t.Array(ActivityDTO) }),
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
            pris: activityById.pris,
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
            pris: activityByUrl.pris,
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
          200: ActivityDTO,
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
