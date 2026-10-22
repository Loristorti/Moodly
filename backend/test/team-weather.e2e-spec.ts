import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { addDays, todayParis, toIsoDate } from '../src/common/utils/date.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_USERS,
} from './helpers/test-app.js';

describe('Team weather (e2e)', () => {
  let app: INestApplication<App>;
  let aliceToken: string;
  let productManagerToken: string;
  let bobToken: string;

  const today = todayParis();

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = app.get(PrismaService);
    const { product, support } = await resetDatabase(prisma);

    const moods = (teamId: string, daysAgo: number, scores: number[]) =>
      scores.map((score) => ({
        teamId,
        day: addDays(today, -daysAgo),
        score,
        tags: [],
      }));

    await prisma.mood.createMany({
      data: [
        // Visible days: (5 + 5 + 4 + 3 + 3 + 4) / 6 = 4 -> sunny
        ...moods(product.id, 1, [5, 5, 4]),
        ...moods(product.id, 3, [3, 3, 4]),
        // Each of these would make it cloudy if it were counted:
        ...moods(product.id, 2, [1, 1]), // hidden day (2 answers)
        ...moods(product.id, 0, [1, 1, 1]), // today
        ...moods(product.id, 8, [1, 1, 1]), // before the 7 days
        // Other team: only a hidden day
        ...moods(support.id, 1, [5, 5]),
      ],
    });

    aliceToken = await loginAs(app, TEST_USERS.alice);
    productManagerToken = await loginAs(app, TEST_USERS.productManager);
    bobToken = await loginAs(app, TEST_USERS.bob);
  });

  afterAll(async () => {
    await app.close();
  });

  const getWeather = (token: string) =>
    request(app.getHttpServer())
      .get('/api/team-weather')
      .set('Authorization', `Bearer ${token}`);

  it('gives the weather of the 7 days before today, visible days only', async () => {
    const { body } = await getWeather(aliceToken).expect(200);

    expect(body).toEqual({
      weather: 'SUNNY',
      period: {
        from: toIsoDate(addDays(today, -7)),
        to: toIsoDate(addDays(today, -1)),
      },
    });
  });

  it('never returns a number: no average, no count of answers', async () => {
    const { body } = await getWeather(aliceToken).expect(200);

    expect(Object.keys(body)).toEqual(['weather', 'period']);
    expect(Object.keys(body.period)).toEqual(['from', 'to']);
  });

  it('gives the manager the same weather as the employees', async () => {
    const { body } = await getWeather(productManagerToken).expect(200);
    expect(body.weather).toBe('SUNNY');
  });

  it('gives no weather to a team without any visible day', async () => {
    const { body } = await getWeather(bobToken).expect(200);
    expect(body.weather).toBeNull();
  });

  it('refuses a request without token (401)', async () => {
    await request(app.getHttpServer()).get('/api/team-weather').expect(401);
  });
});
