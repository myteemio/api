import dayjs from 'dayjs';
import 'dayjs/locale/da';

//Format to YYYY-MM-DD
export function stringToDayjs(date: string) {
  return dayjs(new Date(date)).format('YYYY-MM-DD');
}

//Date to CET(DK) dddd-MM-DD
export function dateToWeekday(date: Date) {
  const formattedDate = dayjs(date).locale('da').format('dddd DD/MM'); 
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}