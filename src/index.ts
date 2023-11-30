import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { activitiesRoute } from './controllers/activities';
import { myteemioRoute } from './controllers/myteemio';
import cors from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import jwt from '@elysiajs/jwt';
import { authRoute } from './controllers/auth';

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

// Setup the Web API
const app = new Elysia({ prefix: '/api' });

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

// Setup controllers
app.use(activitiesRoute);
app.use(myteemioRoute);
app.use(authRoute);

// Start the server
app.listen(process.env.PORT ?? 3001);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
