import { Static } from 'elysia';
import {
  MyTeemioActivitiesWithVotes,
  MyTeemioActivitiesWithoutVotes,
  MyTeemioDTO,
  MyTeemioStatusEnum,
  finalizeTeemioDTO,
  updateTeemioDTO,
} from '../controllers/MyTeemioController';
import { MyTeemio } from '../models/MyTeemio';
import dayjs, { Dayjs } from 'dayjs';

export async function findTeemioById(id: string) {
  return await MyTeemio.findById(id);
}

export async function findTeemioByUrl(url: string) {
  return await MyTeemio.findOne({ url: url });
}

export async function updateTeemioStatusById(id: string, newstatus: Static<typeof MyTeemioStatusEnum>) {
  return await MyTeemio.findByIdAndUpdate(id, { status: newstatus });
}

export async function createTeemio(teemio: Static<typeof MyTeemioDTO>) {
  return await new MyTeemio(teemio).save();
}

export async function updateTeemioById(id: string, teemio: Static<typeof updateTeemioDTO>) {
  return await MyTeemio.findByIdAndUpdate(id, teemio, { new: true });
}

export async function finalizeTeemio(idorurl: string, teemio: Static<typeof finalizeTeemioDTO>) {
  return await MyTeemio.findByIdAndUpdate(
    idorurl,
    {
      final: {
        date: teemio.date,
        activities: teemio.activities,
      },
      status: 'finalized',
    },
    { new: true }
  );
}

export function IsActivityTimeslotsValid(
  activities: Static<typeof MyTeemioActivitiesWithVotes> | Static<typeof MyTeemioActivitiesWithoutVotes>
): boolean {
  let currentFrom: Dayjs | undefined;
  let currentTo: Dayjs | undefined;
  let activitiesSorted = activities.sort((a, b) =>
    dayjs(new Date(a.timeslot.from)).isAfter(dayjs(new Date(b.timeslot.from))) ? 1 : -1
  );
  for (const activity of activitiesSorted) {
    const from = dayjs(new Date(activity.timeslot.from));
    const to = dayjs(new Date(activity.timeslot.to));

    if (from.isAfter(to)) {
      return false;
    } else {
      if (!currentFrom && !currentTo) {
        currentFrom = from;
        currentTo = to;
      } else {
        // Check if current activity overlaps with previous activity
        if (from.isAfter(currentTo)) {
          currentFrom = from;
          currentTo = to;
        } else {
          return false;
        }
      }
    }
  }
  return true;
}
