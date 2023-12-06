import { Static } from 'elysia';
import {
  MyTeemioActivitiesWithVotes,
  MyTeemioActivitiesWithoutVotes,
  MyTeemioActivityWithoutVotesAndTime,
  MyTeemioDTO,
  MyTeemioStatusEnum,
  finalizeTeemioDTO,
  updateTeemioDTO,
} from '../controllers/MyTeemioController';
import { MyTeemio, MyTeemioDocument } from '../models/MyTeemio';
import dayjs, { Dayjs } from 'dayjs';
import { UserDocument } from '../models/User';
import { stringToDayjs } from '../util/date';

export async function findTeemioById(id: string) {
  return await MyTeemio.findById(id);
}

export async function findTeemioByUrl(url: string) {
  return await MyTeemio.findOne({ 'eventinfo.url': url });
}

export async function deleteTeemioById(id: string) {
  return await MyTeemio.findByIdAndDelete(id);
}

export async function updateTeemioStatusById(id: string, newstatus: Static<typeof MyTeemioStatusEnum>) {
  return await MyTeemio.findByIdAndUpdate(id, { status: newstatus });
}

export async function updateTeemioDateVotesById(teemio: MyTeemioDocument, user: UserDocument, dayVotedFor: string[]) {
  for (const day of dayVotedFor) {
    const index = teemio.dates.findIndex((date) => stringToDayjs(date.date.toString()) === stringToDayjs(day));

    if (index !== undefined && index !== -1) {
      teemio.dates[index].votes.push({ id: user.id, name: user.name });
    } else {
      throw new Error('Date voted for could not be found!');
    }
  }

  return await teemio.save();
}

export async function updateTeemioActivityVotesById(
  teemio: MyTeemioDocument,
  user: UserDocument,
  activitiesVotedFor: Static<typeof MyTeemioActivityWithoutVotesAndTime>[]
) {
  for (const activityVotedFor of activitiesVotedFor) {
    let index;

    //Activity is reference
    if (typeof activityVotedFor.activity === 'string') {
      index = teemio.activities.findIndex((activity) => activity.activity === activityVotedFor.activity);
    } else {
      //Activity is custom activity
      const activityName = activityVotedFor.activity.name;
      index = teemio.activities.findIndex((activity) => {
        // Double check that its a custom activity by checking if it has name property
        const customActivity = activity.activity ;
        console.log(customActivity)
        if ('name' in customActivity) {
          return customActivity.name === activityName;
        }
      });
    }

    if (index !== undefined && index !== -1) {
      teemio.activities[index].votes.push({
        id: user.id,
        name: user.name,
      });
    } else {
      throw new Error('The activity could not be voted for!');
    }
  }
  return await teemio.save();
}

export async function createTeemio(teemio: Static<typeof MyTeemioDTO>) {
  return await new MyTeemio(teemio).save();
}

export async function updateTeemioById(id: string, teemio: Static<typeof updateTeemioDTO>) {
  return await MyTeemio.findByIdAndUpdate(id, teemio, { new: true });
}

export async function dateExistsInTeemio(teemio: Static<typeof MyTeemioDTO>, date: string | string[]) {
  const dates = typeof date === 'string' ? [date] : date;
  const teemioDates = teemio.dates.map((date) => dayjs(date.date).format('YYYY-MM-DD'));
  return dates.some((date) => teemioDates?.includes(date));
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
