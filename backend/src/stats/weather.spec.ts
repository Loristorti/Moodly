import { weatherFor } from './weather.js';

describe('weatherFor', () => {
  it('gives no weather without a visible average', () => {
    expect(weatherFor(null)).toBeNull();
  });

  it.each([
    [5, 'SUNNY'],
    [4, 'SUNNY'],
    [3.9, 'PARTLY_CLOUDY'],
    [3.3, 'PARTLY_CLOUDY'],
    [3.2, 'CLOUDY'],
    [2.6, 'CLOUDY'],
    [2.5, 'RAINY'],
    [1, 'RAINY'],
  ])('turns an average of %s into %s', (average, weather) => {
    expect(weatherFor(average)).toBe(weather);
  });
});
