import { describe, expect, test } from 'bun:test';
import { app } from '..';
import { Activity, ActivityDocument } from '../models/Activity';
import {
  TESTcreateAuthToken,
  TESTgetActivityById,
  TESTgetMockUserByEmail,
  TESTgetRandomMyTeemioId,
  TESTgetTeemioById,
  TESTseedDatabase,
  TESTsetupInMemoryDatabase,
} from './routes.helper';
import { MyTeemio, MyTeemioDocument } from '../models/MyTeemio';
import { TESTmockSingleActivityBody, TESTmockSingleTeemioBody, TESTmockUpdateTeemioBody } from '../util/testData';
import { UserDocument } from '../models/User';

const baseURI = `http://localhost:${process.env.PORT ?? 3001}`;
await TESTsetupInMemoryDatabase();
await TESTseedDatabase();

// ------------------ User Routes------------------ //
describe('User Routes', async () => {
  test('(GET)/api/user/myteemios', async () => {
    const user = await TESTgetMockUserByEmail('charlie@example.com');
    const token = await TESTcreateAuthToken(user?.id);

    const req = new Request(`${baseURI}/api/user/myteemios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument[];

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].eventinfo.name).toBe('Annual Company Retreat');
    expect(body[0].activities[0].activity).toBe('656f53446b9f52b36fbde08a');
  });

  test('(GET)/api/user/account', async () => {
    const user = await TESTgetMockUserByEmail('george@example.com');
    const token = await TESTcreateAuthToken(user?.id);

    const req = new Request(`${baseURI}/api/user/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await app.handle(req);
    const body = (await res.json()) as UserDocument;

    expect(res.status).toBe(200);
    expect(body.name).toBe('George Lucas');
    expect(body.email).toBe('george@example.com');
    expect(body.phone).toBe('+1313819383');
  });
});

// ------------------ Activities Routes ------------------ //
describe('Activity Routes', async () => {
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

  test('(POST)/api/activities', async () => {
    const adminUser = await TESTgetMockUserByEmail('test@test.com');
    const token = TESTcreateAuthToken(adminUser?.id);

    const req = new Request(`${baseURI}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(TESTmockSingleActivityBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as ActivityDocument;

    expect(res.status).toBe(200);
    expect(body.name).toBe('Padel Viborg');
    expect(body.price).toBe(299);
    expect(body.category[0]).toBe('sport');

    //Check that the activity was inserted into the database
    const activity = await TESTgetActivityById(body.id);
    expect(activity).not.toBeUndefined();
    expect(activity).not.toBeNull();
    expect(activity!.referralLink).toBe('https://www.padel.dk/centre/klover');
    expect(activity!.estimatedHours).toBe(2);
  });
});

// ------------------ MyTeemio Routes ------------------ //
describe('MyTeemio Routes', async () => {
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
    expect(body.organizer.name).toBe('Ethan Hunt');
    expect(body.organizer.email).toBe('ethan@example.com');
    expect(body.status).toBe('locked');
    expect(body.dates[0].votes[0]).toEqual({ id: 'user3' });
  });

  test('(POST)/api/myteemio', async () => {
    const req = new Request(`${baseURI}/api/myteemio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TESTmockSingleTeemioBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;

    // Get the user that created it
    const user = await TESTgetMockUserByEmail('hej@hej.com');

    expect(res.status).toBe(200);
    expect(body.organizer.name).toBe(user?.name || '');
    expect(body.organizer.email).toBe(user?.email || '');
    expect(body.eventinfo.name).toBe('Padel is fun');
    expect(new Date(body.dates[0].date).toISOString()).toBe(new Date('2023-12-06').toISOString());

    //Check that the teemio was inserted into the database
    const teemio = (await TESTgetTeemioById(body.id)) as MyTeemio;
    expect(teemio.eventinfo.name).toBe('Padel is fun');
    expect(teemio.activities[0].activity.address.city).toBe('Cool City');
    expect(teemio.activities[0].activity.address.country).toBe('Cool Country');
  });

  test('(POST)/api/myteemio/vote/:id', async () => {
    const mockTeemioVoteBody = {
      activitiesVotedOn: [
        {
          activity: {
            name: 'My cool custom activity2',
            description: 'This is a custom activity2',
            image: 'custom_activit2y.jpg',
            address: {
              address1: '123412313Custom Road',
              zipcode: '12345123',
              city: 'Custom City2',
              country: 'Cool Country',
            },
          },
        },
      ],
      datesVotedOn: ['2023-12-06'],
      userinfo: {
        name: 'Thomas',
        email: 'thomas@gmail.com',
      },
    };
    const teemioId = await TESTgetRandomMyTeemioId();
    const req = new Request(`${baseURI}/api/myteemio/vote/${teemioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockTeemioVoteBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;
  });

  test('(PUT)/api/myteemio/status/:id', async () => {
    const adminUser = await TESTgetMockUserByEmail('test@test.com');
    const token = TESTcreateAuthToken(adminUser?.id);

    const teemioId = await TESTgetRandomMyTeemioId('finalized');
    expect(teemioId).not.toBeNull();
    expect(teemioId).toBeDefined();

    const req = new Request(`${baseURI}/api/myteemio/status/${teemioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newstatus: 'active' }),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as { message: string };

    expect(res.status).toBe(200);
    expect(body.message).toBe('Status successfully updated');

    //Check that the status has changed
    const updatedTeemio = (await TESTgetTeemioById(teemioId!)) as MyTeemioDocument;
    expect(updatedTeemio.status).toBe('active');
  });

  test('(PUT)/api/myteemio', async () => {
    const adminUser = await TESTgetMockUserByEmail('test@test.com');
    const token = TESTcreateAuthToken(adminUser?.id);

    const teemioId = await TESTgetRandomMyTeemioId();

    expect(teemioId).toBeDefined();

    const req = new Request(`${baseURI}/api/myteemio/${teemioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(TESTmockUpdateTeemioBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;

    expect(res.status).toBe(200);
    expect(body.activities[0].activity.name).toBe('Updated activity1');
    expect(body.activities[0].activity.address.city).toBe('A New City');
    expect(body.activities[1].activity.address.city).toBe('Random City');

    //Check that the teemio was inserted into the database
    const teemio = (await TESTgetTeemioById(teemioId!)) as MyTeemio;
    expect(teemio.activities[0].activity.name).toBe('Updated activity1');
    expect(teemio.activities[0].activity.address.city).toBe('A New City');
    expect(teemio.activities[1].activity.address.city).toBe('Random City');
  });

  test('(POST)/api/myteemio/finalize/:id', async () => {
    const adminUser = await TESTgetMockUserByEmail('test@test.com');
    const token = TESTcreateAuthToken(adminUser?.id);

    //Check current status of teemio
    const teemioId = await TESTgetRandomMyTeemioId('active');
    expect(teemioId).toBeDefined();
    const teemio = (await TESTgetTeemioById(teemioId!)) as MyTeemioDocument;
    expect(teemio.status).toBe('active');

    const mockTeemioFinalizeBody = {
      activities: [
        {
          activity: teemio.activities[0].activity,
          timeslot: {
            from: '2023-12-12T12:30:00.000Z',
            to: '2023-12-12T14:30:00.000Z',
          },
          votes: [{ id: adminUser?.id, name: adminUser?.name }],
        },
      ],
      date: teemio.dates[0].date,
      sendInvites: false,
    };

    const req = new Request(`${baseURI}/api/myteemio/finalize/${teemioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mockTeemioFinalizeBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;

    expect(res.status).toBe(200);
    expect(body.status).toBe('finalized');

    expect(body.final).toBeDefined();
    expect(body.final).not.toBeNull();
    expect(body.final?.activities).toHaveLength(1);
    expect(body.final?.date.toString()).toBe(teemio.dates[0].date.toString());
  });

  test('(DELETE)/api/myteemio/:id', async () => {
    const adminUser = await TESTgetMockUserByEmail('test@test.com');
    const token = TESTcreateAuthToken(adminUser?.id);

    //First check that the teemio exists
    const teemioId = await TESTgetRandomMyTeemioId('locked');
    expect(teemioId).toBeDefined();
    const teemio = (await TESTgetTeemioById(teemioId!)) as MyTeemioDocument;
    expect(teemio.organizer.name).toBe('Ethan Hunt');
    expect(teemio.organizer.email).toBe('ethan@example.com');
    expect(teemio.status).toBe('locked');

    //Delete that teemio
    const req = new Request(`${baseURI}/api/myteemio/${teemioId}`, {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    //Check that the same teemio we just found is now deleted
    const res = await app.handle(req);
    const body = await res.json();
    const teemioAfterDelete = await TESTgetTeemioById(teemioId!);

    expect(res.status).toBe(200);
    expect(body.message).toBe('Teemio was succesfully deleted');
    expect(teemioAfterDelete).toBeNull();
  });
});

// ------------------ Admin Routes ------------------ //
describe('Admin Routes', async () => {
  test('(GET)/api/admin/create', async () => {
    const user = await TESTgetMockUserByEmail('test@test.com');
    const token = await TESTcreateAuthToken(user?.id);

    const req = new Request(`${baseURI}/api/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'test', email: 'newuser@test.com', phone: '+4512345678', type: 'user' }),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as UserDocument;

    expect(res.status).toBe(200);
    expect(body.name).toBe('test');
    expect(body.email).toBe('newuser@test.com');
    expect(body.phone).toBe('+4512345678');
  });
});

// ------------------ Auth Routes ------------------ //
describe('Auth Routes', async () => {
  test('(POST)/api/auth/signin', async () => {
    const user = await TESTgetMockUserByEmail('test@test.com');

    const req = new Request(`${baseURI}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: user?.email }),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as { message: string };

    expect(res.status).toBe(200);
    expect(body.message).toBe('Check your email for magic link to login!');
    
  });
});
