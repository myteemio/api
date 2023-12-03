import { Elysia, Static, t } from 'elysia';
import { BadRequestDTO } from '../types/BadRequestDTO';
import { InternalServerErrorDTO } from '../types/InternalServerErrorDTO';
import { NotFoundDTO } from '../types/NotFoundDTO';
import dayjs, { Dayjs } from 'dayjs';
import {
  IsActivityTimeslotsValid,
  createTeemio,
  dateExistsInTeemio,
  deleteTeemioById,
  finalizeTeemio,
  findTeemioById,
  findTeemioByUrl,
  updateTeemioById,
  updateTeemioStatusById,
} from '../services/myTeemioService';
import {
  createNewUser,
  findUserByEmail,
  isOwnerOfTeemioOrAdmin,
} from '../services/userService';
import { mapMyTeemioToMyTeemioDTO } from '../services/mappers';
import { activityExists } from '../services/activityService';
import mongoose from 'mongoose';
import { isAuthenticated } from '../plugins/authPlugin';
import { ForbiddenDTO } from '../types/ForbiddenDTO';
import { UnauthorizedDTO } from '../types/UnauthorizedDTO';
import { stringToDayjs } from '../util/date';

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

export const MyTeemioActivitiesWithVotes = t.Array(
  myTeemioCustomActivityOrReferenceWithVotesDTO
);
export const MyTeemioActivitiesWithoutVotes = t.Array(
  myTeemioCustomActivityOrReferenceWithoutVotesDTO
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

export const MyTeemioStatusEnum = t.Union([
  t.Literal('active'),
  t.Literal('locked'),
  t.Literal('finalized'),
]);

export const MyTeemioDTO = t.Object({
  id: t.Optional(t.String()),
  status: MyTeemioStatusEnum,
  activities: MyTeemioActivitiesWithVotes,
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
        activities: MyTeemioActivitiesWithVotes,
      })
    )
  ),
});

export const createTeemioDTO = t.Object({
  ...t.Omit(MyTeemioDTO, ['id', 'final', 'status']).properties,
  dates: t.Array(MyTeemioDateWithoutVote),
  activities: MyTeemioActivitiesWithoutVotes,
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

const voteTeemioDTO = t.Object({
  activitiesVotedOn: t.Array(
    t.Object({
      activity: myTeemioCustomActivityOrReferenceWithVotesDTO,
    })
  ),
  datesVotedOn: t.Array(t.String({ format: 'date' })),
  userinfo: t.Object({
    name: t.String(),
    email: t.Optional(t.String()),
  }),
});

export const MyTeemioController = new Elysia({ name: 'routes:myteemio' }).group(
  '/myteemio',
  (app) => {
    app.post(
      '/',
      async ({ body, set }) => {
        try {
          // Check if activities lenght is above 0
          if (body.activities.length === 0) {
            set.status = 400;
            return {
              message: 'No activities chosen',
              error_code: 'noactivities',
            };
          }

          if (body.dates.length === 0) {
            set.status = 400;
            return {
              message: 'No dates chosen',
              error_code: 'nodates',
            };
          }

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

          // Check if activity id exists
          const activityRefIds = body.activities.reduce(function (
            result: string[],
            element
          ) {
            if (typeof element.activity === 'string') {
              result.push(element.activity);
            }
            return result;
          },
          []);

          if (activityRefIds.length > 0) {
            const exists = await activityExists(activityRefIds);
            if (!exists) {
              set.status = 400;
              return {
                message: 'Activity does not exist',
                error_code: 'activitydoesnotexist',
              };
            }
          }

          // Check if timeslots make sense
          if (!IsActivityTimeslotsValid(body.activities)) {
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

    app.use(isAuthenticated({ type: 'All' })).put(
      '/:id',
      async ({ body, set, params: { id }, user }) => {
        try {
          if (mongoose.isValidObjectId(id)) {
            const foundTeemio = await findTeemioById(id);

            if (!foundTeemio) {
              set.status = 404;
              return {
                message: 'The Teemio was not found',
                error_code: 'teemionotfound',
              };
            }

            if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
              set.status = 403;
              return {
                message: 'You have no access to this Teemio',
                error_code: 'forbidden',
              };
            }

            const updatedTeemio = await updateTeemioById(id, body);
            if (updatedTeemio) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(updatedTeemio);
            }

            set.status = 404;
            return {
              message: 'The Teemio was not found',
              error_code: 'teemionotfound',
            };
          }
          set.status = 404;
          return {
            message: 'The ID provided was not valid',
            error_code: 'teemionotfound',
          };
        } catch (error) {
          set.status = 500;
          return {
            message: `There was an error updating the teemio. Error: ${error}`,
            error_code: 'internalservererror',
          };
        }
      },
      {
        body: updateTeemioDTO,
        response: {
          200: MyTeemioDTO,
          400: BadRequestDTO,
          401: UnauthorizedDTO,
          403: ForbiddenDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Update a single teemio event',
          tags: ['My Teemio'],
          security: [{ AccessToken: [] }],
        },
      }
    );

    app.get(
      '/pdf/:id',
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

    app.use(isAuthenticated({ type: 'All' })).put(
      '/status/:id',
      async ({ body, set, params: { id }, user }) => {
        try {
          if (mongoose.isValidObjectId(id)) {
            const foundTeemio = await findTeemioById(id);

            if (!foundTeemio) {
              set.status = 404;
              return {
                message: 'Teemio not found. Make sure the ID is correct',
                error_code: 'teemionotfound',
              };
            }

            if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
              set.status = 403;
              return {
                message: 'You have no access to this Teemio',
                error_code: 'forbidden',
              };
            }

            const updateStatusById = await updateTeemioStatusById(
              id,
              body.newstatus
            );
            if (updateStatusById) {
              set.status = 200;
              return { message: 'Status successfully updated' };
            }
            set.status = 404;
            return {
              message: 'Teemio not found. Make sure the ID or URL is correct',
              error_code: 'teemionotfound',
            };
          }
          set.status = 400;
          return {
            message: 'The ID is not valid',
            error_code: 'badrequest',
          };
        } catch (error) {
          set.status = 500;
          return {
            message: `There was an error while setting the new status: ${error}`,
            error_code: 'internalservererror',
          };
        }
      },
      {
        body: t.Object({
          newstatus: MyTeemioStatusEnum,
        }),
        response: {
          200: t.Object({ message: t.String({ default: 'Status updated' }) }),
          401: UnauthorizedDTO,
          403: ForbiddenDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Update the status of the Teemio event',
          tags: ['My Teemio'],
          security: [{ AccessToken: [] }],
        },
      }
    );

    app.use(isAuthenticated({ type: 'All' })).post(
      '/finalize/:id',
      async ({ body, set, params: { id }, user }) => {
        try {
          if (mongoose.isValidObjectId(id)) {
            const foundTeemio = await findTeemioById(id);

            if (!foundTeemio) {
              set.status = 404;
              return {
                message: 'Teemio not found',
                error_code: 'teemionotfound',
              };
            }

            if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
              set.status = 403;
              return {
                message: 'You have no access to this Teemio',
                error_code: 'forbidden',
              };
            }

            const finalize = await finalizeTeemio(id, body);
            if (finalize) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(finalize);
            }
            set.status = 404;
            return {
              message: 'Teemio not found',
              error_code: 'teemionotfound',
            };
          }

          set.status = 404;
          return {
            message: 'The provided ID is not valid',
            error_code: 'teemionotfound',
          };
        } catch (error) {
          set.status = 500;
          return {
            message: `There was an error while trying to finalize the Teemio. Error: ${error}`,
            error_code: 'internalservererror',
          };
        }
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
          security: [{ AccessToken: [] }],
        },
      }
    );

    app.post(
      '/vote/:id',
      async ({ body, set, params: { id } }) => {
        //De sender array af aktiviteter og array af dates

        //Check om teemio eksisterer
        if (mongoose.isValidObjectId(id)) {
          const foundTeemio = await findTeemioById(id);

          if (!foundTeemio) {
            set.status = 404;
            return {
              message: 'Teemio not found',
              error_code: 'teemionotfound',
            };
          }

          const activityRefIds = body.activitiesVotedOn.reduce(function (
            result: string[],
            element
          ) {
            if (typeof element.activity === 'string') {
              result.push(element.activity);
            }
            return result;
          },
          []);

          //Check if activities voted on are legit
          if (activityRefIds.length > 0) {
            const exists = await activityExists(activityRefIds);
            if (!exists) {
              set.status = 400;
              return {
                message: 'Activity voted on does not exist',
                error_code: 'activitydoesnotexist',
              };
            }
          }

          //Check om date votes er legit
          if (body.datesVotedOn.length > 0) {
            const datesToCheck = body.datesVotedOn.map((date) =>
              stringToDayjs(date)
            );
            const exists = await dateExistsInTeemio(id, datesToCheck);
            if (!exists) {
              set.status = 400;
              return {
                message: 'Date voted on does not exists in Teemio',
                error_code: 'datedoesnotexist',
              };
            } else {
              console.log('Dates exists in teemio');
            }
          }

          //For each activity in activitiesVotedOn, add this users name to the vote array

          //For each date in datesVotedOn, add this users name to the vote array
        }
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

    app.use(isAuthenticated({ type: 'All' })).delete(
      '/:id',
      async ({ set, params: { id }, user }) => {
        try {
          if (mongoose.isValidObjectId(id)) {
            const foundTeemio = await findTeemioById(id);
            if (foundTeemio) {
              if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
                set.status = 403;
                return {
                  message: 'You have no access to this Teemio',
                  error_code: 'forbidden',
                };
              }
  
              set.status = 200;
              await deleteTeemioById(id);
              return { message: 'Teemio was succesfully deleted' };
            }
            set.status = 404;
            return {
              message: 'Teemio was not found',
              error_code: 'teemionotfound',
            };
          } else {
            set.status = 404;
            return {
              message: 'The provided ID is not valid',
              error_code: 'teemionotfound',
            };
          }
        } catch (error) {
          set.status = 500;
          return {
            message: `There was an error while trying to delete the Teemio. Error: ${error}`,
            error_code: 'internalservererror',
          };
        }
      },
      {
        response: {
          200: t.Object({
            message: t.String({ default: `Teemio was succesfully deleted` }),
          }),
          403: ForbiddenDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Delete a Teemio with ID',
          tags: ['My Teemio'],
          security: [{ AccessToken: [] }],
        },
      }
    );

    app.get(
      '/:idorurl',
      async ({ params: { idorurl }, set }) => {
        try {
          if(mongoose.isValidObjectId(idorurl)) {
          
            const teemio = await findTeemioById(idorurl);
            if(teemio) {
              set.status = 200;
              return mapMyTeemioToMyTeemioDTO(teemio);
            }
            set.status = 404;
            return { message: 'Teemio not found', error_code: 'teemionotfound' };
          }
  
          const teemio = await findTeemioByUrl(idorurl)
          if(teemio) {
            set.status = 200;
            return mapMyTeemioToMyTeemioDTO(teemio);
          } else {
            set.status = 404;
            return { message: 'Teemio not found', error_code: 'teemionotfound' };
          }
        } catch (error) {
          set.status = 500;
          return {
            message: `There was an error while trying to find the Teemio. Error: ${error}`,
            error_code: 'internalservererror',
          };
        }
      },
      {
        response: {
          200: MyTeemioDTO,
          404: NotFoundDTO,
          500: InternalServerErrorDTO,
        },
        detail: {
          summary: 'Get a Teemio with ID or URL',
          tags: ['My Teemio'],
        },
      }
    );

    return app;
  }
);
