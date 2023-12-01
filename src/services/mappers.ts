import { Static } from 'elysia';
import { GetActivityDTO } from '../controllers/activities';
import { Activity, ActivityDocument } from '../models/Activity';
import { makeUrlSafe } from './activityService';

//ACTIVITY MAPPERS
export function mapActivityToActivityDTO(
  activity: ActivityDocument
): Static<typeof GetActivityDTO> {
  return {
    id: activity.id,
    name: activity.name,
    url: activity.url,
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
    location: activity.location,
    estimatedHours: activity.estimatedHours,
  };
}