import { Elysia, Static, t } from 'elysia';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import { MyTeemio } from '../models/MyTeemio';
import { createTeemio, updateTeemioStatusById, updateTeemioStatusByUrl } from '../services/myTeemioService';
import { getUserById } from '../services/userService';
import { mapMyTeemioToMyTeemioDTO } from '../services/mappers';

const myTeemioCustomActivityDTO = t.Object({
  name: t.String(),
  description: t.String(),
  image: t.String(),
  address: t.Object({
    address1: t.String(),
    address2: t.Optional(t.Nullable(t.String())),
    zipcode: t.String(),
    city: t.String(),
    country: t.String(),
  }),
});

const myTeemioCustomActivityOrReferenceWithVotesDTO = t.Object({
  activity: t.Union([t.String({ description: 'ID of activity' }), myTeemioCustomActivityDTO]),
  timeslot: t.Object({
    from: t.Date(),
    to: t.Date(),
  }),
  votes: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
});

const myTeemioCustomActivityOrReferenceWithoutVotesDTO = t.Omit(myTeemioCustomActivityOrReferenceWithVotesDTO, [
  'votes',
]);

const MyTeemioDateWithVote = t.Object({
  date: t.Date(),
  votes: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
});

const MyTeemioDateWithoutVote = t.Omit(MyTeemioDateWithVote, ['votes']);

export const MyTeemioDTO = t.Object({
  id: t.Optional(t.String()),
  status: t.Union([t.Literal('active'), t.Literal('locked'), t.Literal('finalized')]),
  activities: t.Array(myTeemioCustomActivityOrReferenceWithVotesDTO),
  organizer: t.String(),
  eventinfo: t.Object({
    name: t.String(),
    description: t.String(),
    logo: t.String(),
  }),
  dates: t.Array(MyTeemioDateWithVote),
  final: t.Optional(
    t.Nullable(
      t.Object({
        date: t.Date(),
        activities: myTeemioCustomActivityOrReferenceWithVotesDTO,
      })
    )
  ),
});

const createTeemioDTO = t.Intersect([
  t.Omit(MyTeemioDTO, ['id', 'final', 'dates', 'activities', 'status']),
  t.Object({ dates: t.Array(MyTeemioDateWithoutVote) }),
  t.Object({ activities: t.Array(myTeemioCustomActivityOrReferenceWithoutVotesDTO) }),
]);

const finalizeTeemioDTO = t.Object({
  activities: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceWithVotesDTO,
    })
  ),
  date: t.Date(),
  sendInvites: t.Boolean(),
});

const voteTeemioDTO = t.Object({
  activitiesVotedOn: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceWithVotesDTO,
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
        console.log('test123');
        if (body) {
          try {
            const newTeemio: Static<typeof MyTeemioDTO> = {
              ...body,
              status: 'active',
              activities: body.activities.map((v, i) => {
                return { ...v, votes: [{ id: '', name: '' }] };
              }),
              dates: body.dates.map((v, i) => {
                return { ...v, votes: [{ id: '', name: '' }] };
              }),
            };

            const createdTeemio = await createTeemio(newTeemio);
            return mapMyTeemioToMyTeemioDTO(createdTeemio);
          } catch (error) {
            set.status = 400;
            return {
              message: `Bad request ${error}`,
              error_code: 'badrequest',
            };
          }
        }
        set.status = 500;
        return {
          message: 'There was an error with the request',
          error_code: 'internalservererror',
        };
      },
      {
        body: createTeemioDTO,
        response: {
          200: MyTeemioDTO,
          400: BadRequestDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Create a new Teemio event',
          tags: ['My Teemio'],
        },
      }
    );

    // app.get(
    //   '/:idorurl',
    //   async ({ params: { idorurl }, set }) => {
    //     try {
    //       const teemioById = await findTeemioById(idorurl);
    //       if (teemioById) {
    //         set.status = 200;
    //         return {
    //           id: idorurl,
    //           status: teemioById.status,
    //           activities: teemioById.activities.map((activity) => ({
    //             ...activity,
    //             votes: activity.votes.map((vote) => ({
    //               id: vote.id.toString(),
    //               name: vote.name,
    //             })),
    //           })),
    //           organizer: {
    //             id: teemioById.organizer.toString(),
    //             name: (await getUserById(teemioById.organizer.toString()))?.name || '',
    //           },
    //           eventinfo: teemioById.eventinfo,
    //           dates: teemioById.dates.map((date) => ({
    //             ...date,
    //             votes: date.votes.map((vote) => ({
    //               id: vote.id.toString(),
    //               name: vote.name,
    //             })),
    //           })),
    //           final: teemioById.final,
    //         };
    //       }

    //       const teemioByUrl = await findTeemioById(idorurl);

    //       if (teemioByUrl) {
    //         set.status = 200;
    //         return {
    //           id: idorurl,
    //           status: teemioByUrl.status,
    //           activities: teemioByUrl.activities.map((activity) => ({
    //             ...activity,
    //             votes: activity.votes.map((vote) => ({
    //               id: vote.id.toString(),
    //               name: vote.name,
    //             })),
    //           })),
    //           organizer: {
    //             id: teemioByUrl.organizer.toString(),
    //             name: (await getUserById(teemioByUrl.organizer.toString()))?.name || '',
    //           },
    //           eventinfo: teemioByUrl.eventinfo,
    //           dates: teemioByUrl.dates.map((date) => ({
    //             ...date,
    //             votes: date.votes.map((vote) => ({
    //               id: vote.id.toString(),
    //               name: vote.name,
    //             })),
    //           })),
    //           final: teemioByUrl.final,
    //         };
    //       }
    //     } catch (error) {
    //       set.status = 404;
    //       return {
    //         message: 'Teemio not found. Make sure the ID or URL is correct',
    //         error_code: 'teemionotfound',
    //       };
    //     }
    //     set.status = 500;
    //     return {
    //       message: 'There was an error with the request',
    //       error_code: 'internalservererror',
    //     };
    //   },
    //   {
    //     response: {
    //       200: MyTeemioDTO,
    //       404: NotFoundDTO,
    //       500: InternalServerErrorDTO,
    //     },
    //     detail: {
    //       summary: 'Get a single Teemio event',
    //       tags: ['My Teemio'],
    //     },
    //   }
    // );

    app.put(
      '/:idorurl',
      async ({ body, set, params: { idorurl } }) => {
        set.status = 500;
        return { message: 'Not implemented', error_code: 'notimplemented' };
      },
      {
        body: createTeemioDTO,
        response: {
          200: MyTeemioDTO,
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
      async ({ body, set, params: { idorurl } }) => {
        try {
          const updateStatusById = await updateTeemioStatusById(idorurl, body.newstatus);
          if (updateStatusById) {
            set.status = 200;
            return { message: 'Status successfully updated' };
          }

          const updateStatusByUrl = await updateTeemioStatusByUrl(idorurl, body.newstatus);
          if (updateStatusByUrl) {
            set.status = 200;
            return { message: 'Status successfully updated' };
          }
        } catch (error) {
          set.status = 404;
          return {
            message: 'Teemio not found. Make sure the ID or URL is correct',
            error_code: 'teemionotfound',
          };
        }

        set.status = 500;
        return {
          message: 'An error ocurred with the server',
          error_code: 'internalservererror',
        };
      },
      {
        body: t.Object({
          newstatus: t.String({ default: 'locked' }),
        }),
        response: {
          200: t.Object({ message: t.String({ default: 'Status updated' }) }),
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
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
          200: MyTeemioDTO,
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
          200: MyTeemioDTO,
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
