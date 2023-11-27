import { Activity } from '../models/Activity';

export async function findActivityById(id: string) {
  return await Activity.findById(id);
}

export async function findActivityByUrl(url: string) {
  return await Activity.findOne({ url: url });
}
