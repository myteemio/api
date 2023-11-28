import { Elysia, NotFoundError, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { findActivityBId, findActivityBUrl } from '../services/activityService';

const ActivityDTO = t.Object({
  id: t.String(),
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
    country: t.String(),
  }),
  referralLink: t.String(),
  location: t.Object({
    lat: t.Number(),
    long: t.Number(),
  }),
  estimatedHours: t.Number(),
});

export const activitiesRoute = new Elysia({ name: 'routes:activities' }).group('/activities', (app) => {
  // /activites
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
      const activityById = await findActivityBId(idorurl);

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

      const activityByUrl = await findActivityBUrl(idorurl);

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
