import { Elysia, NotFoundError } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { ActivityController } from './controllers/ActivityController';
import { MyTeemioController } from './controllers/MyTeemioController';
import cors from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import { AuthController } from './controllers/AuthController';

// Check for ENV variables
if (!process.env.JWT_SECRET) {
  throw new Error('No JWT_SECRET configured!');
}

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('No DB_CONNECTION_STRING configured!');
}

if (!process.env.RESEND_API_KEY) {
  throw new Error('No RESEND_API_KEY configured!');
}

// Setup db
import './db/setupMongoDB';
import { UserController, UserControllerExtra } from './controllers/UserController';
import { BadRequestError, ForbiddenError, InternalServerError, UnauthorizedError } from './types/CustomErrors';

// Setup the Web API
export const app = new Elysia({ prefix: '/api' });

// Setup Helmet security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Setup CORS
app.use(cors({ preflight: true, methods: '*', origin: true }));

// Setup Swagger
app.use(
  swagger({
    exclude: ['/api/'], // Exclude base path from Swagger. Such that PREFLIGHT requests doesnt show.
    documentation: {
      info: {
        title: 'Teemio API documentation',
        version: '1.0.0',
        description: 'This page documents the entire API behind teemio.',
      },
      tags: [
        {
          name: 'Activities',
          description: 'Endpoints around activities',
        },
        {
          name: 'My Teemio',
          description: "Endpoints for CRUD'ing Teemio events",
        },
        {
          name: 'Auth',
          description: 'Endpoints for everything related to authentication',
        },
        {
          name: 'User',
          description: 'All endpoints related to user data',
        },
        {
          name: 'default',
          description: 'All other endpoints',
        },
      ],
      components: {
        securitySchemes: {
          AccessToken: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'The JWT Authorization access token used to authenticate the logged in user ',
          },
        },
      },
    },
  })
);

// App register custom errors
app.error({
  ForbiddenError: ForbiddenError,
  BadRequestError: BadRequestError,
  NotFoundError: NotFoundError,
  UnauthorizedError: UnauthorizedError,
  InternalServerError: InternalServerError,
});

// Setup controllers
app.use(ActivityController);
app.use(MyTeemioController);
app.use(AuthController);
app.use(UserController);
app.use(UserControllerExtra);

// Start the server
app.listen(process.env.PORT ?? 3001);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
