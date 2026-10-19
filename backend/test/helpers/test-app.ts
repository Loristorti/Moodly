import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { setupApp } from '../../src/app.setup.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

export const TEST_PASSWORD = 'Test1234!';

export const TEST_USERS = {
  productManager: 'manager.produit@test.dev',
  alice: 'alice@test.dev',
  supportManager: 'manager.support@test.dev',
  bob: 'bob@test.dev',
};

/** Same setup as the real server, without the login rate limit. */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  await app.init();
  return app;
}

/** Empties every table, then creates 2 teams with 1 manager and 1 employee each. */
export async function resetDatabase(prisma: PrismaService) {
  await prisma.$transaction([
    prisma.checkIn.deleteMany(),
    prisma.mood.deleteMany(),
    prisma.user.deleteMany(),
    prisma.team.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const product = await prisma.team.create({
    data: { name: 'Équipe Produit' },
  });
  const support = await prisma.team.create({
    data: { name: 'Équipe Support' },
  });

  await prisma.user.createMany({
    data: [
      {
        email: TEST_USERS.productManager,
        firstName: 'Marc',
        lastName: 'Durand',
        role: 'MANAGER',
        teamId: product.id,
        passwordHash,
      },
      {
        email: TEST_USERS.alice,
        firstName: 'Alice',
        lastName: 'Martin',
        role: 'EMPLOYEE',
        teamId: product.id,
        passwordHash,
      },
      {
        email: TEST_USERS.supportManager,
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: 'MANAGER',
        teamId: support.id,
        passwordHash,
      },
      {
        email: TEST_USERS.bob,
        firstName: 'Bob',
        lastName: 'Petit',
        role: 'EMPLOYEE',
        teamId: support.id,
        passwordHash,
      },
    ],
  });

  return { product, support };
}

/** Logs in and returns the access token. */
export async function loginAs(
  app: INestApplication<App>,
  email: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password: TEST_PASSWORD })
    .expect(200);
  return (response.body as { accessToken: string }).accessToken;
}
