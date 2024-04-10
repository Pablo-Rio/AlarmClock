import { MILLISECONDS_IN_A_DAY } from "./value";

export function timeToMilliseconds(time: string): number {
  return new Date(`01/01/1970 ${time}`).getTime();
}

export function timeToPercentageOfDay(time: string): number {   
  return timeToMilliseconds(time) % MILLISECONDS_IN_A_DAY / MILLISECONDS_IN_A_DAY;
}

export function currentTimePercentageOfDay(): number {
  return new Date().getTime() % MILLISECONDS_IN_A_DAY / MILLISECONDS_IN_A_DAY;
}