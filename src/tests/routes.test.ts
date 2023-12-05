import { describe, expect, test } from 'bun:test';
import { app } from '..';
import { Activity } from '../models/Activity';
import { seedDatabase, setupInMemoryDatabase } from './routes.helper';
import { MyTeemio } from '../models/MyTeemio';

const baseURI = `http://localhost:${process.env.PORT ?? 3001}`;

describe('Routes', async () => {
  await setupInMemoryDatabase();
  await seedDatabase();

  test('(GET)/api/activities', async () => {
    const req = new Request(`${baseURI}/api/activities`);
    const res = await app.handle(req);
    const body = (await res.json()) as { activities: Activity[] };

    expect(res.status).toBe(200);
    expect(body.activities.length).toBe(5);
    expect(body.activities[0].name).toBe('Beach Yoga Retreat');
    expect(body.activities[4].url).toBe('underwater-diving-expedition');
  });

  test('(GET)/api/activities/:idorurl', async () => {
    const req = new Request(`${baseURI}/api/activities/gourmet-cooking-class`);
    const res = await app.handle(req);
    const body = (await res.json()) as Activity;

    expect(res.status).toBe(200);
    expect(body.name).toBe('Gourmet Cooking Class');
    expect(body.price).toBe(100);
    expect(body.location.lat).toBe(37.7749);
  });

  test('(GET)/api/myteemio/:idorurl', async () => {
    const req = new Request(`${baseURI}/api/myteemio/cultural-day`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemio;

    expect(res.status).toBe(200);
    expect(body.organizer).toBe('Emily Clark');
    expect(body.status).toBe('locked');
    expect(body.dates[0].votes[0]).toEqual({ id: 'user3' });
  });
});
