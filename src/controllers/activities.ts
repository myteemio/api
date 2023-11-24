import { Elysia, t } from 'elysia';

export const ActivityDTO = t.Object({
  id: t.Optional(t.String({ examples: '2ec64518-3d26-48ad-ac52-4cb8759f6942' })),
  title: t.String(),
  description: t.String(),
  image: t.String(),
  price: t.Number(),
  persons: t.Number(),
  type: t.String(),
  location: t.Object({
    address: t.String(),
    lat: t.Number(),
    long: t.Number(),
  }),
});

export const activitiesRoute = (app: Elysia) =>
  app.group('/activities', (app) => {
    // /activites
    app.get(
      '/',
      () => {
        return [];
      },
      {
        detail: {
          summary: 'Returns a list of all activities',
          description: 'Shows all activities',
          tags: ['Activities'],
        },
      }
    );

    // /activities/:id
    app.get(
      '/:id',
      () => {
        return {
          id: '2ec64518-3d26-48ad-ac52-4cb8759f6942',
          title: 'Test',
          description: 'test',
          image: 'test',
          price: 4,
          persons: 4,
          type: 'yeeet',
          location: {
            address: 'Test address, 2100 København Ø',
            lat: 55.5,
            long: 43.3,
          },
        };
      },
      {
        detail: {
          summary: 'Returns a single activity with :id',
          tags: ['Activities'],
        },
      }
    );

    return app;
  });
