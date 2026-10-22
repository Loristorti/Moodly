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

describe('Team message (e2e)', () => {
  let app: INestApplication<App>;
  let productManagerToken: string;
  let supportManagerToken: string;
  let aliceToken: string;
  let bobToken: string;

  const MESSAGE = 'On décale la prochaine livraison d’une semaine.';

  beforeAll(async () => {
    app = await createTestApp();
    await resetDatabase(app.get(PrismaService));
    productManagerToken = await loginAs(app, TEST_USERS.productManager);
    supportManagerToken = await loginAs(app, TEST_USERS.supportManager);
    aliceToken = await loginAs(app, TEST_USERS.alice);
    bobToken = await loginAs(app, TEST_USERS.bob);
  });

  afterAll(async () => {
    await app.close();
  });

  const getMessage = (token: string) =>
    request(app.getHttpServer())
      .get('/api/team-message')
      .set('Authorization', `Bearer ${token}`);

  const publish = (token: string, body: object) =>
    request(app.getHttpServer())
      .put('/api/team-message')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const remove = (token: string) =>
    request(app.getHttpServer())
      .delete('/api/team-message')
      .set('Authorization', `Bearer ${token}`);

  it('returns no message before the manager writes one', async () => {
    const { body } = await getMessage(aliceToken).expect(200);
    expect(body).toEqual({ message: null });
  });

  it('lets the manager publish a message, trimmed', async () => {
    const { body } = await publish(productManagerToken, {
      content: `  ${MESSAGE}  `,
    }).expect(200);

    expect(body).toEqual({ content: MESSAGE, updatedAt: expect.any(String) });
  });

  it('shows the message to the employees of the same team only', async () => {
    const { body } = await getMessage(aliceToken).expect(200);
    expect(body.message.content).toBe(MESSAGE);

    // Bob is in the other team
    const other = await getMessage(bobToken).expect(200);
    expect(other.body).toEqual({ message: null });
    const otherManager = await getMessage(supportManagerToken).expect(200);
    expect(otherManager.body).toEqual({ message: null });
  });

  it('replaces the previous message', async () => {
    await publish(productManagerToken, {
      content: 'Point d’équipe vendredi.',
    }).expect(200);

    const { body } = await getMessage(aliceToken).expect(200);
    expect(body.message.content).toBe('Point d’équipe vendredi.');
  });

  it('refuses an employee who tries to publish or remove (403)', async () => {
    await publish(aliceToken, { content: 'Message' }).expect(403);
    await remove(aliceToken).expect(403);
  });

  it('refuses a request without token (401)', async () => {
    await request(app.getHttpServer()).get('/api/team-message').expect(401);
  });

  it.each([
    ['an empty message', { content: '   ' }],
    ['a message over 280 characters', { content: 'a'.repeat(281) }],
    ['a missing content', {}],
    ['a teamId sent by the client', { content: 'Message', teamId: 'other' }],
  ])('refuses %s (400)', async (_label, body) => {
    await publish(productManagerToken, body).expect(400);
  });

  it('lets the manager remove the message', async () => {
    await remove(productManagerToken).expect(204);

    const { body } = await getMessage(aliceToken).expect(200);
    expect(body).toEqual({ message: null });
    // Removing again is not an error
    await remove(productManagerToken).expect(204);
  });
});
