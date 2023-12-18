import { Activity,  } from '../models/Activity';
import { MyTeemioDocument } from '../models/MyTeemio';

export async function getAllActivities() {
  return await Activity.find({});
}

export async function findActivityById(id: string) {
  return await Activity.findById(id);
}

export async function findActivityNamesInTeemio(teemio: MyTeemioDocument) {
  let activityNames: string[] = [];
  for (const activity of teemio.activities) {
    if(typeof activity.activity === 'string') {
      const activityDocument = await findActivityById(activity.activity);
      if(activityDocument) {
        activityNames.push(activityDocument.name);
      }
    } else {
      activityNames.push(activity.activity.name)
    }
  }

  return activityNames;
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


