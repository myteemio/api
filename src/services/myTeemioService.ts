import { MyTeemio } from '../models/MyTeemio';

export async function findTeemioById(id: string) {
  return await MyTeemio.findById(id);
}

export async function findTeemioByUrl(url: string) {
  return await MyTeemio.findOne({ url: url });
}

export async function updateTeemioStatusById(id: string, status: string) {
  return await MyTeemio.findByIdAndUpdate(id, { status: status });
}

export async function updateTeemioStatusByUrl(url: string, status: string) {
  return await MyTeemio.findOneAndUpdate({url: url}, {status: status});
}