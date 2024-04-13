import { millisecondsInADay } from "./value";

export function timeToMilliseconds(time: string): number {
  return new Date(`01/01/1970 ${time}`).getTime();
}

export function timeToPercentageOfDay(time: string): number {
  return (timeToMilliseconds(time) % millisecondsInADay) / millisecondsInADay;
}

export function currentTimePercentageOfDay(date = new Date().getTime()): number {
  // console.log(date % millisecondsInADay);
  
  return (date % millisecondsInADay) / millisecondsInADay;
}
