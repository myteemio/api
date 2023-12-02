import { Activity, ActivityDocument } from '../models/Activity';

export async function getAllActivities() {
  return await Activity.find({});
}

export async function findActivityById(id: string) {
  return await Activity.findById(id);
}

export async function activityExists(activityId: string | string[]) {
  return await Activity.exists({ _id: { $in: typeof activityId === 'string' ? [activityId] : activityId } });
}

export async function findActivityByUrl(url: string) {
  return await Activity.findOne({ url: url });
}

export async function createNewActivity(activity: Activity) {
  return await new Activity(activity).save();
}

export function makeUrlSafe(name: string) {
  // Replace spaces with hyphens
  var urlSafeName = name.replace(/\s+/g, '-');
  // Remove non-alphanumeric characters (except hyphens)
  urlSafeName = urlSafeName.replace(/[^a-zA-Z0-9\-]/g, '');
  // Convert to lowercase
  return urlSafeName.toLowerCase();
}
