import { Elysia, t } from 'elysia';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { MyTeemio } from '../models/MyTeemio';

const myTeemioUserDTO = t.Object({
  id: t.String(),
  name: t.String(),
});

const myTeemioCustomActivityDTO = t.Object({
  name: t.String(),
  description: t.String(),
  image: t.String(),
  adress: t.Object({
    address1: t.String(),
    address2: t.Optional(t.Nullable(t.String())),
    zipcode: t.String(),
    city: t.String(),
    country: t.String(),
  }),
});

const myTeemioCustomActivityOrReferenceDTO = t.Union([
  t.String({ description: 'ID of activity' }),
  myTeemioCustomActivityDTO,
]);

const myTeemioActivityDTO = t.Object({
  activity: myTeemioCustomActivityOrReferenceDTO,
});

const createTeemioDTO = t.Object({
  activities: t.Array(myTeemioActivityDTO),
  eventinfo: t.Object({
    name: t.String(),
    description: t.String(),
    //TODO: Change back to t.File() when it works
    logo: t.String(),
  }),
  dates: t.Array(t.Date()),
  organizer: t.Object({
    name: t.String(),
    email: t.String(),
    phone: t.String(),
  }),
});

const returnTeemioDTO = t.Object({
  id: t.String(),
  status: t.String(),
  activities: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceDTO,
      timeslot: t.Object({
        from: t.Date(),
        to: t.Date(),
      }),
      votes: t.Array(myTeemioUserDTO),
    })
  ),
  organizer: myTeemioUserDTO,
  eventinfo: t.Object({
    name: t.String(),
    description: t.String(),
    logo: t.String(),
  }),
  dates: t.Array(
    t.Object({
      date: t.Date(),
      votes: t.Array(myTeemioUserDTO),
    })
  ),
  final: t.Object({
    date: t.Date(),
    activity: myTeemioCustomActivityOrReferenceDTO,
  }),
});

const editMyTeemioDTO = t.Object({
  activities: t.Array(myTeemioActivityDTO),
  eventinfo: t.Object({
    name: t.String(),
    description: t.String(),
    logo: t.File(),
  }),
  dates: t.Array(t.Date()),
});

const finalizeTeemioDTO = t.Object({
  activities: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceDTO,
    })
  ),
  date: t.Date(),
  sendInvites: t.Boolean(),
});

const voteTeemioDTO = t.Object({
  activitiesVotedOn: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceDTO,
    })
  ),
  datesVotedOn: t.Array(t.Date()),
  userinfo: t.Object({
    name: t.String(),
    email: t.Optional(t.String()),
  }),
});

export const myteemioRoute = (app: Elysia) =>
  app.group('/myteemio', (app) => {
    app.post(
      '/create',
      async ({ body, set }) => {
        if (body) {
          try {
            // Create a new MyTeemio instance with the request body data
            const newTeemio = new MyTeemio({
              status: 'active',
              activities: body.activities,
              eventinfo: body.eventinfo,
              dates: body.dates,
              organizer: '6564aad708cd300b74d201ae',
              final: {
                date: new Date(),
                activity: 'test',
              },
            });

            newTeemio.save();

            // Set success status and return the saved user's ID
            set.status = 200;
            return { id: 'test' };
          } catch (error) {
            set.status = 400;
            return { message: 'Bad request', error_code: 'badrequest' };
          }
        }
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: createTeemioDTO,
        response: {
          200: t.Object({ id: t.String({ default: 'ID of created event' }) }), // ID of the teemio
          400: BadRequestDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Create a new Teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    app.get(
      '/:idorurl',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        response: {
          200: returnTeemioDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Get a single Teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    app.put(
      '/:idorurl',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: editMyTeemioDTO,
        response: {
          200: returnTeemioDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Update a single teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    app.get(
      '/:idorurl/pdf',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        response: {
          200: t.Object({ pdf: t.File() }),
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Return a PDF version of the Teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    app.put(
      '/:idorurl/status',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: t.Object({
          newstatus: t.String({ default: 'locked' }),
        }),
        detail: {
          summary: 'Update the status of the Teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    app.post(
      '/:idorurl/finalize',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: finalizeTeemioDTO,
        response: {
          200: returnTeemioDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Finalize the Teemio event and set the status to completed',
          tags: ['My Teemio'],
        },
      }
    );

    app.post(
      '/:idorurl/vote',
      ({ set }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: voteTeemioDTO,
        response: {
          200: returnTeemioDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Let users vote on their favorite activities or dates',
          tags: ['My Teemio'],
        },
      }
    );

    return app;
  });
