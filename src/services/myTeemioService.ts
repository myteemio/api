import { MyTeemio } from '../models/MyTeemio';

export async function findTeemioById(id: string) {
  return await MyTeemio.findById(id);
}

export async function findTeemioByUrl(url: string) {
  return await MyTeemio.findOne({ url: url });
}