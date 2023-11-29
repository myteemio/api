import { Static } from 'elysia';
import { GetActivityDTO } from '../controllers/activities';
import { Activity, ActivityDocument } from '../models/Activity';

export async function getAllActivities() {
  return await Activity.find({});
}

export async function findActivityById(id: string) {
  return await Activity.findById(id);
}

export async function findActivityByUrl(url: string) {
  return await Activity.findOne({ url: url });
}

export async function createNewActivity(activity: Activity) {
  return await new Activity(activity).save();
}

// Function to map Activity to ActivityDTO
export function mapActivityToActivityDTO(activity: ActivityDocument): Static<typeof GetActivityDTO> {
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

export function makeUrlSafe(name: string) {
  // Replace spaces with hyphens
  var urlSafeName = name.replace(/\s+/g, '-');

  // Remove non-alphanumeric characters (except hyphens)
  urlSafeName = urlSafeName.replace(/[^a-zA-Z0-9\-]/g, '');

  // Convert to lowercase
  return urlSafeName.toLowerCase();
}
