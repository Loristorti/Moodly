import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgresql://moodly:moodly@localhost:5432/moodly',
  JWT_SECRET: 'a'.repeat(32),
  MIN_RESPONSES_PER_DAY: '3',
};

describe('validateEnv', () => {
  it('accepts a valid configuration', () => {
    expect(validateEnv(validEnv)).toEqual(validEnv);
  });

  it('uses the default threshold when it is not set', () => {
    const { MIN_RESPONSES_PER_DAY: _unused, ...withoutThreshold } = validEnv;
    expect(() => validateEnv(withoutThreshold)).not.toThrow();
  });

  it.each([
    ['a missing DATABASE_URL', { DATABASE_URL: undefined }, 'DATABASE_URL'],
    ['a short JWT_SECRET', { JWT_SECRET: 'short' }, 'JWT_SECRET'],
    [
      'the example JWT_SECRET',
      { JWT_SECRET: 'change-me-with-a-long-random-string' },
      'JWT_SECRET',
    ],
    [
      'a threshold that is not a number',
      { MIN_RESPONSES_PER_DAY: 'three' },
      'MIN_RESPONSES_PER_DAY',
    ],
    [
      'a threshold of 1 (no anonymity)',
      { MIN_RESPONSES_PER_DAY: '1' },
      'MIN_RESPONSES_PER_DAY',
    ],
  ])('rejects %s', (_case, override, variable) => {
    expect(() => validateEnv({ ...validEnv, ...override })).toThrow(variable);
  });
});
