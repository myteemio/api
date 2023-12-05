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
  updateTeemioActivityVotesById,
  updateTeemioById,
  updateTeemioDateVotesById,
  updateTeemioStatusById,
} from '../services/myTeemioService';
import { createNewUser, findUserByEmail, isOwnerOfTeemioOrAdmin } from '../services/userService';
import { mapMyTeemioToMyTeemioDTO } from '../services/mappers';
import { activityExists } from '../services/activityService';
import mongoose from 'mongoose';
import { isAuthenticated } from '../plugins/authPlugin';
import { ForbiddenDTO } from '../types/ForbiddenDTO';
import { UnauthorizedDTO } from '../types/UnauthorizedDTO';
import { stringToDayjs } from '../util/date';
import { UserDocument } from '../models/User';
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from '../types/CustomErrors';
import { errorHandler } from '../util/response';

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

const myTeemioCustomActivityOrReferenceWithoutVotesDTO = t.Omit(myTeemioCustomActivityOrReferenceWithVotesDTO, [
  'votes',
]);

const myTeemioCustomActivityOrReferenceWithoutVotesAndTimeDTO = t.Omit(myTeemioCustomActivityOrReferenceWithVotesDTO, [
  'votes',
  'timeslot',
]);

export const MyTeemioActivitiesWithVotes = t.Array(myTeemioCustomActivityOrReferenceWithVotesDTO);
export const MyTeemioActivitiesWithoutVotes = t.Array(myTeemioCustomActivityOrReferenceWithoutVotesDTO);

export const MyTeemioActivitiesWithoutVotesAndTime = t.Array(myTeemioCustomActivityOrReferenceWithoutVotesAndTimeDTO);

export const MyTeemioActivityWithoutVotesAndTime = myTeemioCustomActivityOrReferenceWithoutVotesAndTimeDTO;

const MyTeemioDateWithVote = t.Object({
  date: t.String({ format: 'date' }),
  votes: t.Array(
    t.Object({
      id: t.String(),
    })
  ),
});

const MyTeemioDateWithoutVote = t.Omit(MyTeemioDateWithVote, ['votes']);

export const MyTeemioStatusEnum = t.Union([t.Literal('active'), t.Literal('locked'), t.Literal('finalized')]);

export const MyTeemioDTO = t.Object({
  id: t.Optional(t.String()),
  status: MyTeemioStatusEnum,
  activities: MyTeemioActivitiesWithVotes,
  organizer: t.String(),
  eventinfo: t.Object({
    name: t.String(),
    description: t.String(),
    logo: t.String(),
    url: t.String(),
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
  date: t.String({ format: 'date' }),
  sendInvites: t.Boolean(),
});

const voteTeemioDTO = t.Object({
  activitiesVotedOn: t.Array(MyTeemioActivityWithoutVotesAndTime),
  datesVotedOn: t.Array(t.String({ format: 'date' })),
  userinfo: t.Object({
    name: t.String(),
    email: t.Optional(t.String()),
  }),
});

export const MyTeemioController = new Elysia({ name: 'routes:myteemio' }).group('/myteemio', (app) => {
  app.post(
    '/',
    async ({ body }) => {
      // Check if activities lenght is above 0
      if (body.activities.length === 0) {
        throw new BadRequestError('No activities chosen');
      }

      if (body.dates.length === 0) {
        throw new BadRequestError('No dates chosen');
      }

      // Check if activity id exists
      const activityRefIds = body.activities.reduce(function (result: string[], element) {
        if (typeof element.activity === 'string') {
          result.push(element.activity);
        }
        return result;
      }, []);

      if (activityRefIds.length > 0) {
        const exists = await activityExists(activityRefIds);
        if (!exists) {
          throw new BadRequestError('Activity does not exist');
        }
      }

      // Check if timeslots make sense
      if (!IsActivityTimeslotsValid(body.activities)) {
        throw new BadRequestError('Make sure activities begin before they end and that they do not overlap');
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
    },
    {
      error({ error, set }) {
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        return errorHandler(set.status, 500, `Error getting all activities: ${error}`);
      },
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

  app.get(
    ':idorurl',
    async ({ params: { idorurl }, set }) => {
      if (mongoose.isValidObjectId(idorurl)) {
        const teemio = await findTeemioById(idorurl);
        if (teemio) {
          return mapMyTeemioToMyTeemioDTO(teemio);
        }
        throw new NotFoundError('Teemio not found!');
      }

      const teemio = await findTeemioByUrl(idorurl);
      if (teemio) {
        return mapMyTeemioToMyTeemioDTO(teemio);
      }
      throw new NotFoundError('Teemio not found!');
    },
    {
      error({ error, set }) {
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error.message}`);
        }
        return errorHandler(set.status, 500, `Error: ${error.message}`);
      },
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

  app.use(isAuthenticated({ type: 'All' })).put(
    '/:id',
    async ({ body, params: { id }, user }) => {
      if (mongoose.isValidObjectId(id)) {
        const foundTeemio = await findTeemioById(id);

        if (!foundTeemio) {
          throw new NotFoundError('The Teemio was not found');
        }

        if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
          throw new ForbiddenError('You have no access to this Teemio');
        }

        const updatedTeemio = await updateTeemioById(id, body);
        if (updatedTeemio) {
          return mapMyTeemioToMyTeemioDTO(updatedTeemio);
        }

        throw new NotFoundError('The Teemio was not found');
      }
      throw new BadRequestError('The provided ID was not valid');
    },
    {
      error({ error, set }) {
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof ForbiddenError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        return errorHandler(set.status, 500, `Error getting all activities: ${error}`);
      },
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
      if (mongoose.isValidObjectId(id)) {
        const foundTeemio = await findTeemioById(id);

        if (!foundTeemio) {
          throw new NotFoundError('Teemio not found!');
        }

        if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
          throw new ForbiddenError('You do not have access to this Teemio');
        }

        const updateStatusById = await updateTeemioStatusById(id, body.newstatus);
        if (updateStatusById) {
          return { message: 'Status successfully updated' };
        }
        throw new NotFoundError('Teemio not found!');
      }
      throw new BadRequestError('The ID is not valid');
    },
    {
      error({ error, set }) {
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof ForbiddenError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        return errorHandler(set.status, 500, `Error: ${error}`);
      },
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

  app.post(
    '/vote/:id',
    async ({ body, set, params: { id } }) => {
      //Check om teemio eksisterer
      if (mongoose.isValidObjectId(id)) {
        const foundTeemio = await findTeemioById(id);

        if (!foundTeemio) {
          throw new NotFoundError('Teemio not found!');
        }

        const activityRefIds = body.activitiesVotedOn.reduce(function (result: string[], activity) {
          if (typeof activity.activity === 'string') {
            result.push(activity.activity);
          }
          return result;
        }, []);

        //Check if activities exists in teemio
        if (activityRefIds.length > 0) {
          const exists = await activityExists(activityRefIds);
          if (!exists) {
            throw new BadRequestError('Activity voted on does not exist');
          }
        }

        let votingUser: UserDocument | null = null;

        // No email on user, create a new user every time
        if (!body.userinfo.email) {
          const newUser = await createNewUser({
            name: body.userinfo.name,
            type: 'user',
          });

          votingUser = newUser;
        }

        if (body.userinfo.email) {
          const existingUser = await findUserByEmail(body.userinfo.email);

          if (!existingUser) {
            const createdUser = await createNewUser({
              name: body.userinfo.name,
              email: body.userinfo.email,
              type: 'user',
            });
            votingUser = createdUser;
          }
        }

        if (!votingUser) {
          throw new InternalServerError('The user voting couldnt be created');
        }

        //Check if votes exists in teemio
        if (body.datesVotedOn.length > 0) {
          const datesToCheck = body.datesVotedOn.map((date) => stringToDayjs(date));
          const exists = await dateExistsInTeemio(mapMyTeemioToMyTeemioDTO(foundTeemio), datesToCheck);
          if (!exists) {
            throw new BadRequestError('Date voted on does not exists in Teemio');
          }
        }

        await updateTeemioDateVotesById(foundTeemio, votingUser, body.datesVotedOn);
        await updateTeemioActivityVotesById(foundTeemio, votingUser, body.activitiesVotedOn);

        return mapMyTeemioToMyTeemioDTO(foundTeemio);
      }
      throw new BadRequestError('Teemio ID required');
    },
    {
      error({ error, set }) {
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error.message}`);
        }
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `${error.message}`);
        }
        if (error instanceof InternalServerError) {
          return errorHandler(set.status, error.statusCode, `${error.message}`);
        }
        return errorHandler(set.status, 500, `Error: ${error.message}`);
      },
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

  app.use(isAuthenticated({ type: 'All' })).post(
    '/finalize/:id',
    async ({ body, set, params: { id }, user }) => {
      if (mongoose.isValidObjectId(id)) {
        const foundTeemio = await findTeemioById(id);

        if (!foundTeemio) {
          throw new NotFoundError('Teemio not found');
        }

        if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
          throw new ForbiddenError('You have no access to this Teemio');
        }

        const finalize = await finalizeTeemio(id, body);
        if (finalize) {
          return mapMyTeemioToMyTeemioDTO(finalize);
        }
        throw new InternalServerError('Teemio could not be finalized!');
      }

      throw new BadRequestError('The provided ID is not valid');
    },
    {
      error({ error, set }) {
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof ForbiddenError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        if (error instanceof InternalServerError) {
          return errorHandler(set.status, error.statusCode, `${error}`);
        }
        return errorHandler(set.status, 500, `Error: ${error}`);
      },
      body: finalizeTeemioDTO,
      response: {
        200: MyTeemioDTO,
        404: NotFoundDTO,
        403: ForbiddenDTO,
        500: InternalServerErrorDTO,
      },
      detail: {
        summary: 'Finalize the Teemio event and set the status to completed',
        tags: ['My Teemio'],
        security: [{ AccessToken: [] }],
      },
    }
  );
  app.use(isAuthenticated({ type: 'All' })).delete(
    '/:id',
    async ({ set, params: { id }, user }) => {
      if (mongoose.isValidObjectId(id)) {
        const foundTeemio = await findTeemioById(id);
        if (foundTeemio) {
          if (!isOwnerOfTeemioOrAdmin(foundTeemio.organizer, user!)) {
            throw new ForbiddenError('You have no access to this teemio!');
          }

          const deleted = await deleteTeemioById(id);
          if (deleted) {
            return { message: 'Teemio was succesfully deleted' };
          }
          throw new InternalServerError('There was an error deleting!');
        }
        throw new NotFoundError('Teemio was not found!');
      }
      throw new BadRequestError('The ID provided is not valid');
    },
    {
      error({ error, set }) {
        if (error instanceof ForbiddenError) {
          return errorHandler(set.status, error.statusCode, `Error: ${error.message}`);
        }
        if (error instanceof InternalServerError) {
          return errorHandler(set.status, error.statusCode, `Error: ${error.message}`);
        }
        if (error instanceof NotFoundError) {
          return errorHandler(set.status, error.statusCode, `Error: ${error.message}`);
        }
        if (error instanceof BadRequestError) {
          return errorHandler(set.status, error.statusCode, `Error: ${error.message}`);
        }

        return errorHandler(set.status, 500, `Error: ${error.message}`);
      },
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

  return app;
});
