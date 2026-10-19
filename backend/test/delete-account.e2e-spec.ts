import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import {
  createTestApp,
  loginAs,
  resetDatabase,
  TEST_PASSWORD,
  TEST_USERS,
} from './helpers/test-app.js';

describe('Account deletion (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aliceToken: string;
  let aliceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await resetDatabase(prisma);

    aliceToken = await loginAs(app, TEST_USERS.alice);
    aliceId = (
      await prisma.user.findUniqueOrThrow({
        where: { email: TEST_USERS.alice },
      })
    ).id;

    // Alice answers once before deleting her account
    await request(app.getHttpServer())
      .post('/api/moods')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ score: 3, tags: ['TEAM_SPIRIT'] })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  const deleteMe = (token?: string) => {
    const call = request(app.getHttpServer()).delete('/api/users/me');
    return token ? call.set('Authorization', `Bearer ${token}`) : call;
  };

  it('returns 401 without a token', async () => {
    await deleteMe().expect(401);
  });

  it('deletes the account and returns 204', async () => {
    await deleteMe(aliceToken).expect(204);
  });

  it('removes the user and their check-ins from the database', async () => {
    expect(await prisma.user.findUnique({ where: { id: aliceId } })).toBeNull();
    expect(await prisma.checkIn.count({ where: { userId: aliceId } })).toBe(0);
  });

  it('keeps the anonymous moods', async () => {
    expect(await prisma.mood.count()).toBe(1);
  });

  it('refuses the old token everywhere', async () => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${aliceToken}` };

    await request(server).get('/api/users/me').set(auth).expect(401);
    await request(server).get('/api/moods/today').set(auth).expect(401);
    await request(server)
      .post('/api/moods')
      .set(auth)
      .send({ score: 4, tags: [] })
      .expect(401);
    await deleteMe(aliceToken).expect(401);
  });

  it('can no longer log in', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_USERS.alice, password: TEST_PASSWORD })
      .expect(401);
  });

  it('does not affect the other accounts', async () => {
    const token = await loginAs(app, TEST_USERS.bob);
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
