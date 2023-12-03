import dayjs, { Dayjs } from 'dayjs';

//Format to YYYY-MM-DD
export function stringToDayjs(date: string) {
  return dayjs(new Date (date)).format('YYYY-MM-DD');
}