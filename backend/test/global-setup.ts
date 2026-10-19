import { execSync } from 'node:child_process';

/** Runs once before the e2e suite: applies the migrations to the test database. */
export default function setup() {
  // Safety net: the tests wipe the tables, never run them on another database
  if (!process.env.DATABASE_URL?.includes('/moodly_test')) {
    throw new Error('e2e tests must run on the moodly_test database');
  }
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
