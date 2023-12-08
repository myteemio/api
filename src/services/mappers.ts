import { Static } from 'elysia';
import { ActivityDocument } from '../models/Activity';
import { UserDocument } from '../models/User';
import { MyTeemioDocument } from '../models/MyTeemio';
import { MyTeemioDTO } from '../controllers/MyTeemioController';
import { ActivityDTO } from '../controllers/ActivityController';
import { makeUrlSafe } from '../util/helperFunctions';
import { getUserDTO } from '../controllers/UserController';

// Function to map Activity to ActivityDTO
export function mapActivityToActivityDTO(activity: ActivityDocument): Static<typeof ActivityDTO> {
  return {
    id: activity.id.toString(),
    url: activity.url,
    name: activity.name,
    description: activity.description,
    image: activity.image,
    price: activity.price,
    persons: activity.persons,
    category: activity.category,
    address: {
      address1: activity.address.address1,
      address2: activity.address.address2,
      zipcode: activity.address.zipcode,
      city: activity.address.city,
      country: activity.address.country,
    },
    referralLink: activity.referralLink,
    location: {
      lat: activity.location.lat,
      long: activity.location.long,
    },
    estimatedHours: activity.estimatedHours,
  };
}

export function mapUserToUserDTO(user: UserDocument): Static<typeof getUserDTO> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    type: user.type,
  };
}

export function mapMyTeemioToMyTeemioDTO(teemio: MyTeemioDocument): Static<typeof MyTeemioDTO> {
  return {
    id: teemio.id,
    final: teemio.final
      ? {
          date: teemio.final.date.toString(),
          activities: teemio.final.activities,
        }
      : undefined,
    status: teemio.status,
    organizer: {
      name: teemio.organizer.name,
      email: teemio.organizer.email,
    },
    activities: teemio.activities.map((v) => {
      return {
        activity: v.activity,
        timeslot: {
          from: v.timeslot.from.toString(),
          to: v.timeslot.to.toString(),
        },
        votes: v.votes.map((v) => {
          return {
            id: v.id.toString(),
            name: v.name,
          };
        }),
      };
    }),
    dates: teemio.dates.map((v) => {
      return {
        date: v.date.toString(),
        votes: v.votes.map((v) => {
          return {
            id: v.toString(),
          };
        }),
      };
    }),
    eventinfo: {
      description: teemio.eventinfo.description,
      logo: teemio.eventinfo.logo,
      name: teemio.eventinfo.name,
      url: makeUrlSafe(teemio.eventinfo.name),
    },
  };
}
