import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { addDays, todayParis } from '../src/common/utils/date.js';
import { MoodsService } from '../src/moods/moods.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_USERS,
} from './helpers/test-app.js';

describe('Past check-ins purge (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const today = todayParis();
  const yesterday = addDays(today, -1);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    const users = await prisma.user.findMany({
      where: { email: { in: [TEST_USERS.alice, TEST_USERS.bob] } },
    });
    // Answers of previous days, as they would remain without the purge
    await prisma.checkIn.createMany({
      data: users.flatMap((user) => [
        { userId: user.id, day: yesterday },
        { userId: user.id, day: addDays(today, -7) },
      ]),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes past check-ins when a mood is submitted, and keeps today’s', async () => {
    const token = await loginAs(app, TEST_USERS.alice);

    await request(app.getHttpServer())
      .post('/api/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 4, tags: [] })
      .expect(201);

    const checkIns = await prisma.checkIn.findMany();
    expect(checkIns).toHaveLength(1);
    expect(checkIns[0]?.day).toEqual(today);
  });

  it('can purge on its own, without any new answer', async () => {
    const deleted = await app.get(MoodsService).purgePastCheckIns();

    expect(deleted).toBe(4);
    expect(await prisma.checkIn.count()).toBe(0);
  });

  it('keeps the anonymous moods and the stats unchanged', async () => {
    const { product } = await resetDatabase(prisma);
    await prisma.mood.create({
      data: { score: 3, tags: [], day: yesterday, teamId: product.id },
    });

    await app.get(MoodsService).purgePastCheckIns();

    expect(await prisma.mood.count()).toBe(1);
  });
});
