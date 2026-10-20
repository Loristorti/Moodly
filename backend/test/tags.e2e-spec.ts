import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_USERS,
} from './helpers/test-app.js';

describe('Mood themes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts the themes added in the second version', async () => {
    const token = await loginAs(app, TEST_USERS.alice);

    await request(app.getHttpServer())
      .post('/api/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 3, tags: ['MEANING', 'AUTONOMY', 'ORGANIZATION'] })
      .expect(201);

    const mood = await prisma.mood.findFirstOrThrow();
    expect(mood.tags).toEqual(['MEANING', 'AUTONOMY', 'ORGANIZATION']);
  });

  it('still refuses a health theme', async () => {
    const token = await loginAs(app, TEST_USERS.bob);

    await request(app.getHttpServer())
      .post('/api/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 3, tags: ['COMMUNICATION', 'HEALTH'] })
      .expect(400);
  });
});
