//My teemio db model goes here

import { Activity } from './Activity';

export type MyTeemio = {
  id: string;
  status: 'active' | 'locked' | 'finalized';
  activities: [MyTeemioActivity];
  organizer: string; // ID of user that created this
  eventinfo: {
    name: string;
    description: string;
    logo: string;
  };
  dates: [MyTeemioDates];
  final: {
    date: Date;
    activity: [string | Partial<Activity>]; // ID of our activity or the custom activity they made
  };
};

type MyTeemioDates = {
  date: Date;
  votes: [string]; // ID's of users that voted
};

type MyTeemioActivity = {
  activity: string | Partial<Activity>; // ID of activity in DB or Custom Activity.
  timeslot: {
    from: Date;
    to: Date;
  };
  votes: [string]; // ID's of users that voted
};
