import { Elysia, NotFoundError, t } from 'elysia';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';

const ActivityDTO = t.Object({
  id: t.String(),
  url: t.String(),
  name: t.String(),
  description: t.String(),
  iamge: t.String(),
  pris: t.Number(),
  persons: t.Number(),
  category: t.Array(t.String()),
  address: t.Object({
    adress1: t.String(),
    address2: t.String(),
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

export const activitiesRoute = (app: Elysia) =>
  app.group('/activities', (app) => {
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

    // /activities/:id
    app.get(
      '/:idorurl',
      ({ set }) => {
        set.status = 404;
        return { message: 'Not implemented', error_code: 'notimplemented' };
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
