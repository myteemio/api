import { Activity } from '../models/Activity';
import { MyTeemio } from '../models/MyTeemio';
import { User } from '../models/User';

export const dbActivies: [Activity?] = [
  {
    id: '1234',
    address: {
      address1: 'Test 10',
      address2: 'st. tv.',
      zipcode: '2100',
      city: 'København Ø',
      country: 'Danmark',
    },
    category: ['Race'],
    description: 'Kom ind og ræs hos Race Hall Amager',
    estimatedHours: 2,
    image: 'placeholder.png',
    location: {
      lat: 55.55,
      long: 55.55,
    },
    name: 'Race hall amager',
    persons: 4,
    pris: 259,
    url: 'race-hall-amager-1234',
    referralLink: 'https://google.com',
  },
];

export const dbMyTeemios: [MyTeemio?] = [];

export const dbUsers: [User?] = [];
