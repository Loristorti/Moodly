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

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
    await resetDatabase(app.get(PrismaService));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns a token and the user profile with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_USERS.alice, password: TEST_PASSWORD })
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user).toEqual({
        id: expect.any(String),
        firstName: 'Alice',
        lastName: 'Martin',
        role: 'EMPLOYEE',
        team: { id: expect.any(String), name: 'Équipe Produit' },
      });
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('returns 401 with a wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: TEST_USERS.alice, password: 'wrong-password' })
        .expect(401);

      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('returns 401 with the same message for an unknown email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@test.dev', password: TEST_PASSWORD })
        .expect(401);

      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('returns 400 when the body is invalid or has extra fields', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: TEST_PASSWORD })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.alice,
          password: TEST_PASSWORD,
          role: 'MANAGER',
        })
        .expect(400);
    });
  });

  describe('GET /api/users/me', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('returns the profile of the logged-in user', async () => {
      const token = await loginAs(app, TEST_USERS.supportManager);

      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        firstName: 'Sophie',
        role: 'MANAGER',
        team: { name: 'Équipe Support' },
      });
      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });
});
