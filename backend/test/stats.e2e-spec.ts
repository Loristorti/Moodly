import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import {
  addDays,
  isWorkingDay,
  todayParis,
  toIsoDate,
} from '../src/common/utils/date.js';
import { MoodTag } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_USERS,
} from './helpers/test-app.js';

interface DailyStat {
  date: string;
  average: number | null;
  responses: number | null;
  hidden: boolean;
}

describe('Stats (e2e)', () => {
  let app: INestApplication<App>;
  let productManagerToken: string;
  let supportManagerToken: string;
  let aliceToken: string;

  const today = todayParis();
  const dayBefore = (days: number) => addDays(today, -days);

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = app.get(PrismaService);
    const { product, support } = await resetDatabase(prisma);

    const mood = (
      teamId: string,
      daysAgo: number,
      score: number,
      tags: MoodTag[],
    ) => ({ teamId, day: dayBefore(daysAgo), score, tags });

    await prisma.mood.createMany({
      data: [
        // Yesterday: 3 answers -> visible
        mood(product.id, 1, 4, ['TEAM_SPIRIT']),
        mood(product.id, 1, 4, ['TEAM_SPIRIT', 'RECOGNITION']),
        mood(product.id, 1, 5, ['RECOGNITION']),
        // 2 days ago: only 2 answers -> hidden
        mood(product.id, 2, 1, ['WORKLOAD']),
        mood(product.id, 2, 2, ['WORK_CONDITIONS']),
        // 3 days ago: 3 low answers -> visible
        mood(product.id, 3, 1, ['WORKLOAD', 'MANAGEMENT']),
        mood(product.id, 3, 2, ['WORKLOAD']),
        mood(product.id, 3, 2, ['WORKLOAD']),
        // Previous 30-day period: 35 days ago, 3 good answers -> visible
        mood(product.id, 35, 5, ['TEAM_SPIRIT']),
        mood(product.id, 35, 5, []),
        mood(product.id, 35, 4, []),
        // 40 days ago: only 2 answers -> hidden, left out of the trend
        mood(product.id, 40, 1, []),
        mood(product.id, 40, 1, []),
        // Other team: only 2 answers in the whole period
        mood(support.id, 1, 5, ['RECOGNITION']),
        mood(support.id, 1, 5, ['RECOGNITION']),
      ],
    });

    productManagerToken = await loginAs(app, TEST_USERS.productManager);
    supportManagerToken = await loginAs(app, TEST_USERS.supportManager);
    aliceToken = await loginAs(app, TEST_USERS.alice);
  });

  afterAll(async () => {
    await app.close();
  });

  const getStats = (token: string, query = '') =>
    request(app.getHttpServer())
      .get(`/api/stats/team${query}`)
      .set('Authorization', `Bearer ${token}`);

  const findDay = (daily: DailyStat[], daysAgo: number) =>
    daily.find((day) => day.date === toIsoDate(dayBefore(daysAgo)));

  it('returns 403 for an EMPLOYEE', async () => {
    await getStats(aliceToken).expect(403);
  });

  it('returns one entry per day over the last 30 days, today included', async () => {
    const { body } = await getStats(productManagerToken).expect(200);

    expect(body.period).toEqual({
      from: toIsoDate(dayBefore(29)),
      to: toIsoDate(today),
      days: 30,
    });
    expect(body.threshold).toBe(3);
    expect(body.daily).toHaveLength(30);
    expect(body.daily.map((day: DailyStat) => day.date)).toEqual(
      Array.from({ length: 30 }, (_, i) => toIsoDate(dayBefore(29 - i))),
    );
  });

  it('shows the average and the number of answers of a day with 3 answers', async () => {
    const { body } = await getStats(productManagerToken).expect(200);

    expect(findDay(body.daily, 1)).toEqual({
      date: toIsoDate(dayBefore(1)),
      average: 4.3,
      responses: 3,
      hidden: false,
    });
  });

  it('hides a day with only 2 answers', async () => {
    const { body } = await getStats(productManagerToken).expect(200);

    expect(findDay(body.daily, 2)).toEqual({
      date: toIsoDate(dayBefore(2)),
      average: null,
      responses: null,
      hidden: true,
    });
  });

  it('computes the summary, leaving hidden days out of the average', async () => {
    const { body } = await getStats(productManagerToken).expect(200);

    const workingDays = Array.from({ length: 30 }, (_, i) =>
      dayBefore(i),
    ).filter(isWorkingDay).length;

    expect(body.team).toMatchObject({
      name: 'Équipe Produit',
      employeeCount: 1,
    });
    const participationRate = Math.round((8 / workingDays) * 100) / 100;
    expect(body.summary).toEqual({
      // (4 + 4 + 5 + 1 + 2 + 2) / 6: the hidden day (1 and 2) is not included
      average: 3,
      // (5 + 5 + 4) / 3, 35 days ago: the hidden day 40 days ago is not included
      previousAverage: 4.7,
      participationRate,
      topTags: [
        { tag: 'WORKLOAD', count: 4 },
        { tag: 'RECOGNITION', count: 2 },
        { tag: 'TEAM_SPIRIT', count: 2 },
      ],
      topConcerns: [
        { tag: 'WORKLOAD', count: 4 },
        { tag: 'MANAGEMENT', count: 1 },
        { tag: 'WORK_CONDITIONS', count: 1 },
      ],
      alerts: [
        { type: 'DECLINE', value: -1.7 },
        // WORKLOAD is cited in 4 of the 5 low answers
        { type: 'CONCERN', tag: 'WORKLOAD', value: 0.8 },
        { type: 'LOW_PARTICIPATION', value: participationRate },
      ],
    });
  });

  it('gives no trend when the previous period has no visible day', async () => {
    // Previous 7-day period: from 13 to 7 days ago, no answer
    const { body } = await getStats(productManagerToken, '?days=7').expect(200);

    expect(body.summary.previousAverage).toBeNull();
    expect(
      body.summary.alerts.map((alert: { type: string }) => alert.type),
    ).not.toContain('DECLINE');
  });

  it('only shows the manager’s own team, and hides everything under the threshold', async () => {
    const { body } = await getStats(supportManagerToken).expect(200);

    expect(body.team.name).toBe('Équipe Support');
    expect(body.daily.every((day: DailyStat) => day.hidden)).toBe(true);
    expect(body.summary).toMatchObject({
      average: null,
      previousAverage: null,
      topTags: null,
      topConcerns: null,
    });
    // Only the participation can be pointed out: nothing about the answers
    expect(
      body.summary.alerts.every(
        (alert: { type: string }) => alert.type === 'LOW_PARTICIPATION',
      ),
    ).toBe(true);
  });

  it('refuses a teamId parameter: the team always comes from the token', async () => {
    await getStats(productManagerToken, '?teamId=other-team').expect(400);
  });

  it('accepts days between 7 and 90 only', async () => {
    const { body } = await getStats(productManagerToken, '?days=7').expect(200);
    expect(body.daily).toHaveLength(7);

    await getStats(productManagerToken, '?days=6').expect(400);
    await getStats(productManagerToken, '?days=91').expect(400);
    await getStats(productManagerToken, '?days=abc').expect(400);
  });
});
