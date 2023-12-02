import { Elysia, Static, t } from 'elysia';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import {
  checkTimeSlots,
  createTeemio,
  finalizeTeemio,
  updateTeemioById,
  updateTeemioByUrl,
  updateTeemioStatusById,
  updateTeemioStatusByUrl,
} from '../services/myTeemioService';
import { createNewUser, findUserByEmail } from '../services/userService';
import { mapMyTeemioToMyTeemioDTO } from '../services/mappers';
import { activityExists } from '../services/activityService';
import mongoose from 'mongoose';

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
  activity: t.Union([
    t.String({ description: 'ID of activity' }),
    myTeemioCustomActivityDTO,
  ]),
  timeslot: t.Object({
    from: t.String({ format: 'date-time' }),
    to: t.String({ format: 'date-time' }),
  }),
  votes: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
});

const myTeemioCustomActivityOrReferenceWithoutVotesDTO = t.Omit(
  myTeemioCustomActivityOrReferenceWithVotesDTO,
  ['votes']
);

const MyTeemioDateWithVote = t.Object({
  date: t.String({ format: 'date' }),
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
  status: t.Union([
    t.Literal('active'),
    t.Literal('locked'),
    t.Literal('finalized'),
  ]),
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
        date: t.String({ format: 'date' }),
        activities: myTeemioCustomActivityOrReferenceWithVotesDTO,
      })
    )
  ),
});

export const createTeemioDTO = t.Object({
  ...t.Omit(MyTeemioDTO, ['id', 'final', 'status']).properties,
  dates: t.Array(MyTeemioDateWithoutVote),
  activities: t.Array(myTeemioCustomActivityOrReferenceWithoutVotesDTO),
  organizer: t.Object({
    name: t.String(),
    email: t.String(),
    phone: t.String(),
  }),
});

export const updateTeemioDTO = t.Object({
  ...t.Omit(createTeemioDTO, ['organizer']).properties,
});

export const finalizeTeemioDTO = t.Object({
  activities: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceWithVotesDTO,
    })
  ),
  date: t.String(),
  sendInvites: t.Boolean(),
});

export const activitiesDTO = t.Object({
  activities: t.Array(myTeemioCustomActivityOrReferenceWithoutVotesDTO),
});

const voteTeemioDTO = t.Object({
  activitiesVotedOn: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceWithVotesDTO,
    })
  ),
  datesVotedOn: t.Array(t.String()),
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
            // Check if user already exists
            const existingUser = await findUserByEmail(body.organizer.email);

            let userid = existingUser?.id;

            if (!existingUser) {
              // Create new user
              const newUser = await createNewUser({
                ...body.organizer,
                type: 'user',
              });
              userid = newUser.id;
            }

            if (!userid) {
              set.status = 500;
              return {
                message: 'Error creating Teemio',
                error_code: 'internalservererror',
              };
            }

            // Check if activity id exists
            const activityIds = body.activities.map((v) => {
              if (typeof v.activity === 'string') {
                return v.activity;
              }
            });
            const exists = await activityExists(activityIds);
            if (!exists) {
              set.status = 400;
              return {
                message: 'Activity does not exist',
                error_code: 'activitydoesnotexist',
              };
            }

            // Check if timeslots make sense
            if (!checkTimeSlots(body)) {
              set.status = 400;
              return {
                message:
                  'Make sure activities begin before they end and that they do not overlap',
                error_code: 'invalidtimeslots',
              };
            }

            const newTeemio: Static<typeof MyTeemioDTO> = {
              ...body,
              organizer: userid,
              status: 'active',
              activities: body.activities.map((v) => {
                return { ...v, votes: [] };
              }),
              dates: body.dates.map((v) => {
                return { ...v, votes: [] };
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

    app.put(
      '/:idorurl',
      async ({ body, set, params: { idorurl } }) => {
        //Check if teemio exists
        if (mongoose.isValidObjectId(idorurl)) {
          try {
            const updatedTeemio = await updateTeemioById(idorurl, body);
            if (updatedTeemio) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(updatedTeemio);
            }
          } catch (error) {
            set.status = 404;
            return {
              message: 'Teemio not found',
              error_code: 'teemionotfound',
            };
          }
        } else {
          try {
            const updatedTeemio = await updateTeemioByUrl(idorurl, body);
            if (updatedTeemio) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(updatedTeemio);
            }
          } catch (error) {
            set.status = 404;
            return {
              message: 'Teemio not found',
              error_code: 'teemionotfound',
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
        body: updateTeemioDTO,
        response: {
          200: MyTeemioDTO,
          400: BadRequestDTO,
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
        if (mongoose.isValidObjectId(idorurl)) {
          const updateStatusById = await updateTeemioStatusById(
            idorurl,
            body.newstatus
          );
          if (updateStatusById) {
            set.status = 200;
            return { message: 'Status successfully updated' };
          }
        } else {
          const updateStatusByUrl = await updateTeemioStatusByUrl(
            idorurl,
            body.newstatus
          );
          if (updateStatusByUrl) {
            set.status = 200;
            return { message: 'Status successfully updated' };
          }
        }
        set.status = 404;
        return {
          message: 'Teemio not found. Make sure the ID or URL is correct',
          error_code: 'teemionotfound',
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
      async ({ body, set, params: { idorurl } }) => {
        if (mongoose.isValidObjectId(idorurl)) {
          try {
            const finalize = await finalizeTeemio(idorurl, body);
            if (finalize) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(finalize);
            } else {
              set.status = 404;
              return {
                message: 'Teemio not found',
                error_code: 'teemionotfound',
              };
            }
          } catch (error) {
            set.status = 500;
            return {
              message: 'An error ocurred with the server',
              error_code: 'internalservererror',
            };
          }
        }
        set.status = 404;
        return {
          message: 'Teemio not found. Make sure the ID or URL is correct',
          error_code: 'teemionotfound',
        };
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
