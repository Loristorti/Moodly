export const WEATHER_TYPES = [
  'SUNNY',
  'PARTLY_CLOUDY',
  'CLOUDY',
  'RAINY',
] as const;
export type WeatherType = (typeof WEATHER_TYPES)[number];

/** Lowest average of each weather, on the 1 to 5 scale */
export const SUNNY_FROM = 4;
export const PARTLY_CLOUDY_FROM = 3.3;
export const CLOUDY_FROM = 2.6;

/**
 * A coarse category instead of a number: employees see the weather of their
 * team, never an average they could compare from one day to the next.
 */
export function weatherFor(average: number | null): WeatherType | null {
  if (average === null) {
    return null;
  }
  if (average >= SUNNY_FROM) {
    return 'SUNNY';
  }
  if (average >= PARTLY_CLOUDY_FROM) {
    return 'PARTLY_CLOUDY';
  }
  if (average >= CLOUDY_FROM) {
    return 'CLOUDY';
  }
  return 'RAINY';
}
