import { describe, expect, test } from 'bun:test';
import { app } from '..';
import { Activity, ActivityDocument } from '../models/Activity';
import {
  getActivityByIdOrUrl,
  getRandomTeemioIdToDelete,
  getRandomTeemioIdToUpdate,
  getRandomTeemioIdToUpdate2,
  getTeemioById,
  getToken,
  seedDatabase,
  setupInMemoryDatabase,
} from './routes.helper';
import { MyTeemio, MyTeemioDocument } from '../models/MyTeemio';
import { mockSingleActivityBody, mockSingleTeemioBody, mockUpdateTeemioBody, mockUserBody } from '../util/testData';
import { UserDocument } from '../models/User';

const baseURI = `http://localhost:${process.env.PORT ?? 3001}`;
await setupInMemoryDatabase();
await seedDatabase();

const token = await getToken();

//ACTIVITIES
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
    const req = new Request(`${baseURI}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mockSingleActivityBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as ActivityDocument;

    expect(res.status).toBe(200);
    expect(body.name).toBe('Padel Viborg');
    expect(body.price).toBe(299);
    expect(body.category[0]).toBe('sport');

    //Check that the activity was inserted into the database
    const activity = (await getActivityByIdOrUrl(body.id)) as Activity;
    expect(activity.referralLink).toBe('https://www.padel.dk/centre/klover');
    expect(activity.estimatedHours).toBe(2);
  });
});

describe('MyTeemio Routes', async () => {
  //MYTEEMIO

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

  test('(POST)/api/myteemio', async () => {
    const req = new Request(`${baseURI}/api/myteemio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mockSingleTeemioBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;

    expect(res.status).toBe(200);
    expect(body.eventinfo.name).toBe('Padel is fun');
    expect(new Date(body.dates[0].date).toISOString()).toBe(new Date('2023-12-06').toISOString());

    //Check that the teemio was inserted into the database
    const teemio = (await getTeemioById(body.id)) as MyTeemio;
    expect(teemio.eventinfo.name).toBe('Padel is fun');
    expect(teemio.activities[0].activity.address.city).toBe('Cool City');
    expect(teemio.activities[0].activity.address.country).toBe('Cool Country');
  });

  //TODO: Fix the updateTeemioActivityVotesById function in myTeemioService.ts
  // test('(POST)/api/myteemio/vote/:id', async () => {
  //   const mockTeemioVoteBody = {
  //     activitiesVotedOn: [
  //       {
  //         activity: {
  //           name: 'My cool custom activity2',
  //           description: 'This is a custom activity2',
  //           image: 'custom_activit2y.jpg',
  //           address: {
  //             address1: '123412313Custom Road',
  //             zipcode: '12345123',
  //             city: 'Custom City2',
  //             country: 'Cool Country',
  //           },
  //         },
  //       },
  //     ],
  //     datesVotedOn: ['2023-12-06'],
  //     userinfo: {
  //       name: 'Thomas',
  //       email: 'thomas@gmail.com',
  //     },
  //   };
  //   const teemioId = await getRandomTeemioIdToUpdate();
  //   const req = new Request(`${baseURI}/api/myteemio/vote/${teemioId}`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(mockTeemioVoteBody),
  //   });

  //   const res = await app.handle(req);
  //   const body = (await res.json()) as MyTeemioDocument;

  // });

  test('(PUT)/api/myteemio/status/:id', async () => {
    const teemioId = await getRandomTeemioIdToUpdate();
    const teemio = (await getTeemioById(teemioId)) as MyTeemioDocument;
    expect(teemio.status).toBe('finalized');

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

    //Check that the id has changed
    const updatedTeemio = (await getTeemioById(teemioId)) as MyTeemioDocument;
    expect(updatedTeemio.status).toBe('active');
  });

  test('(PUT)/api/myteemio', async () => {
    const teemioId = await getRandomTeemioIdToUpdate();

    const req = new Request(`${baseURI}/api/myteemio/${teemioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mockUpdateTeemioBody),
    });

    const res = await app.handle(req);
    const body = (await res.json()) as MyTeemioDocument;

    expect(res.status).toBe(200);
    expect(body.activities[0].activity.name).toBe('Updated activity1');
    expect(body.activities[0].activity.address.city).toBe('A New City');
    expect(body.activities[1].activity.address.city).toBe('Random City');

    //Check that the teemio was inserted into the database
    const teemio = (await getTeemioById(teemioId)) as MyTeemio;
    expect(teemio.activities[0].activity.name).toBe('Updated activity1');
    expect(teemio.activities[0].activity.address.city).toBe('A New City');
    expect(teemio.activities[1].activity.address.city).toBe('Random City');
  });

  test('(POST)/api/myteemio/finalize/:id', async () => {
    //Need to create user to add get the ID of a user to add to the teemio
    const reqUser = new Request(`${baseURI}/api/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mockUserBody),
    });
    const resUser = await app.handle(reqUser);
    const userBody = (await resUser.json()) as UserDocument;
    const userId = userBody.id;

    //Check current status of teemio
    const teemioId = await getRandomTeemioIdToUpdate2();
    const teemio = (await getTeemioById(teemioId)) as MyTeemioDocument;
    expect(teemio.status).toBe('active');

    const mockTeemioFinalizeBody = {
      activities: [
        {
          activity: {
            name: 'My cool custom activity',
            description: 'This is a custom activity',
            image: 'custom_activity.jpg',
            address: {
              address1: '1234 Custom Road',
              zipcode: '12345',
              city: 'Custom City',
              country: 'USA',
            },
          },
          votes: [{ id: userId, name: 'Ethan' }],
        },
      ],
      date: '2023-10-15',
      sendInvites: true,
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
    expect(body.activities[0].activity.name).toBe('My cool custom activity');
    
    //Check that the teemio was updated, and the final property has been updated
    //TODO: Final only gets updated in real db. Not mock for some reason
  });

  test('(DELETE)/api/myteemio/:id', async () => {
    //First check that the teemio exists
    const teemioId = await getRandomTeemioIdToDelete();
    const teemio = (await getTeemioById(teemioId)) as MyTeemioDocument;
    expect(teemio.organizer).toBe('Emily Clark');
    expect(teemio.status).toBe('locked');
    expect(teemio.eventinfo.name).toBe('Cultural Day');

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
    const teemioAfterDelete = await getTeemioById(teemioId);

    expect(res.status).toBe(200);
    expect(body.message).toBe('Teemio was succesfully deleted');
    expect(teemioAfterDelete).toEqual({ message: 'Teemio not found!', error_code: 'unauthorized' });
  });
})

