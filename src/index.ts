import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { activitiesRoute } from './controllers/activities';
import { myteemioRoute } from './controllers/myteemio';

const app = new Elysia({ prefix: '/api' });

// Setup Swagger

app.use(
  swagger({
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
      ],
    },
  })
);

// Setup controllers
app.use(activitiesRoute);
app.use(myteemioRoute);

// Start the server
app.listen(process.env.PORT ?? 3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
