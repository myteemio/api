import { Activity } from '../models/Activity';

export async function findActivityBId(id: string) {
  return await Activity.findById(id);
}

export async function findActivityBUrl(url: string) {
  return await Activity.findOne({ url: url });
}