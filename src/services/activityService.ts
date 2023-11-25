import { dbActivies } from '../db/db';

export async function findActivityBId(id: string) {
  return dbActivies.find((p) => p?.id === id);
}

export async function findActivityBUrl(url: string) {
  return dbActivies.find((p) => p?.url === url);
}
