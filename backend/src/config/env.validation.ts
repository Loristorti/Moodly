/**
 * Checks the environment variables at startup: the server refuses to start
 * with a missing or unsafe value, instead of failing later or silently
 * weakening security or anonymity.
 */
export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is missing');
  }

  const jwtSecret = typeof env.JWT_SECRET === 'string' ? env.JWT_SECRET : '';
  if (jwtSecret.length < 32 || jwtSecret.startsWith('change-me')) {
    errors.push(
      'JWT_SECRET must be a random string of at least 32 characters (replace the example value)',
    );
  }

  // A wrong value (e.g. "three") would give NaN and no day would ever be hidden
  const threshold = Number(env.MIN_RESPONSES_PER_DAY ?? 3);
  if (!Number.isInteger(threshold) || threshold < 2) {
    errors.push('MIN_RESPONSES_PER_DAY must be an integer of at least 2');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment variables:\n- ${errors.join('\n- ')}`);
  }
  return env;
}
