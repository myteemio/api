import { Static } from 'elysia';
import { ActivityDocument } from '../models/Activity';
import { UserDocument } from '../models/User';
import { getUserDTO } from '../controllers/auth';
import { MyTeemioDocument } from '../models/MyTeemio';
import { MyTeemioDTO } from '../controllers/myteemio';
import { ActivityDTO } from '../controllers/activities';

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
    final: null,
    status: teemio.status,
    organizer: teemio.organizer,
    activities: teemio.activities.map((v) => {
      return {
        activity: v.activity,
        timeslot: {
          from: v.timeslot.from.toString(),
          to: v.timeslot.to.toString(),
        },
        votes: v.votes,
      };
    }),
    dates: teemio.dates.map((v) => {
      return {
        date: v.date.toString(),
        votes: v.votes,
      };
    }),
    eventinfo: teemio.eventinfo,
  };
}
