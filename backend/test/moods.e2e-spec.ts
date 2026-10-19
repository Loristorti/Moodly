import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { todayParis } from '../src/common/utils/date.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_USERS,
} from './helpers/test-app.js';

describe('Moods (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aliceToken: string;
  let bobToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await resetDatabase(prisma);
    aliceToken = await loginAs(app, TEST_USERS.alice);
    bobToken = await loginAs(app, TEST_USERS.bob);
    managerToken = await loginAs(app, TEST_USERS.productManager);
  });

  afterAll(async () => {
    await app.close();
  });

  const postMood = (token: string, body: object) =>
    request(app.getHttpServer())
      .post('/api/moods')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const getToday = (token: string) =>
    request(app.getHttpServer())
      .get('/api/moods/today')
      .set('Authorization', `Bearer ${token}`);

  describe('roles', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/api/moods')
        .send({ score: 4 })
        .expect(401);
    });

    it('returns 403 when a MANAGER posts a mood', async () => {
      await postMood(managerToken, { score: 4, tags: [] }).expect(403);
    });

    it('returns 403 when a MANAGER asks for today status', async () => {
      await getToday(managerToken).expect(403);
    });
  });

  describe('validation', () => {
    it.each([
      ['a score of 0', { score: 0 }],
      ['a score of 6', { score: 6 }],
      ['a decimal score', { score: 3.5 }],
      ['a score sent as text', { score: '4' }],
      ['a missing score', { tags: [] }],
      [
        'more than 3 tags',
        {
          score: 3,
          tags: ['WORKLOAD', 'MANAGEMENT', 'RECOGNITION', 'TEAM_SPIRIT'],
        },
      ],
      ['an unknown tag', { score: 3, tags: ['HEALTH'] }],
      ['a duplicated tag', { score: 3, tags: ['WORKLOAD', 'WORKLOAD'] }],
      ['an extra teamId field', { score: 3, tags: [], teamId: 'other-team' }],
      ['an extra day field', { score: 3, tags: [], day: '2026-01-01' }],
    ])('returns 400 for %s', async (_case, body) => {
      await postMood(bobToken, body).expect(400);
    });

    it('did not record anything for the rejected requests', async () => {
      await getToday(bobToken).expect(200).expect({ submitted: false });
    });
  });

  describe('daily submission', () => {
    it('reports no answer yet today', async () => {
      await getToday(aliceToken).expect(200).expect({ submitted: false });
    });

    it('records the first mood of the day with 201', async () => {
      await postMood(aliceToken, { score: 2, tags: ['WORKLOAD', 'MANAGEMENT'] })
        .expect(201)
        .expect({ submitted: true });
    });

    it('then reports that today is done', async () => {
      await getToday(aliceToken).expect(200).expect({ submitted: true });
    });

    it('rejects a second mood the same day with 409', async () => {
      const response = await postMood(aliceToken, {
        score: 5,
        tags: [],
      }).expect(409);
      expect(response.body.message).toBe(
        'Vous avez déjà renseigné votre humeur aujourd’hui',
      );
    });

    it('accepts a mood without tags', async () => {
      await postMood(bobToken, { score: 4 }).expect(201);
    });
  });

  describe('anonymity (checked directly in the database)', () => {
    it('the Mood table has no column linked to a user', async () => {
      const columns = await prisma.$queryRaw<{ column_name: string }[]>`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'Mood' ORDER BY column_name`;

      expect(columns.map((c) => c.column_name)).toEqual([
        'day',
        'id',
        'score',
        'tags',
        'teamId',
      ]);
    });

    it('the stored mood only contains the score, tags, day and team', async () => {
      const alice = await prisma.user.findUniqueOrThrow({
        where: { email: TEST_USERS.alice },
      });
      const moods = await prisma.mood.findMany({ where: { score: 2 } });

      expect(moods).toHaveLength(1);
      expect(moods[0]).toEqual({
        id: expect.any(String),
        score: 2,
        tags: ['WORKLOAD', 'MANAGEMENT'],
        day: todayParis(),
        teamId: alice.teamId,
      });

      const stored = JSON.stringify(moods[0]);
      for (const personalData of [
        alice.id,
        alice.email,
        alice.firstName,
        alice.lastName,
      ]) {
        expect(stored).not.toContain(personalData);
      }
    });

    it('the check-in only stores the user and the day, with no link to the mood', async () => {
      const checkIns = await prisma.checkIn.findMany();

      expect(checkIns).toHaveLength(2);
      for (const checkIn of checkIns) {
        expect(Object.keys(checkIn).sort()).toEqual(['day', 'userId']);
        expect(checkIn.day).toEqual(todayParis());
      }
    });
  });
});
