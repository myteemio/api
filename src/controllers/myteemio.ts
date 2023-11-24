import { Elysia, t } from 'elysia';
import { ActivityDTO } from './activities';

const timeslotDTO = t.Object({
  timeslot: t.Object({
    start: t.Date(),
    end: t.Date(),
  }),
});

export const CreateMyTeemioDTO = t.Object({
  activities: t.Array(t.Intersect([t.Object({ id: t.String() }), timeslotDTO])),
});

export const myteemioRoute = (app: Elysia) =>
  app.group('/myteemio', (app) =>
    app.post(
      '/create',
      ({ body }) => {
        return body;
      },
      {
        body: CreateMyTeemioDTO,
        detail: {
          summary: 'Create a new teemio',
          description: 'Create a new teemio event',
          tags: ['My Teemio'],
        },
      }
    )
  );
