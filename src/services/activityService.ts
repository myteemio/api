import { Activity,  } from '../models/Activity';

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


