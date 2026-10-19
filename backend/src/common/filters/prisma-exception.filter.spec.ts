import { ArgumentsHost, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('db error', {
    code,
    clientVersion: 'test',
  });
}

function mockHost() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  beforeAll(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it.each([
    ['P2002', 409, 'Cette ressource existe déjà'],
    ['P2025', 404, 'Ressource introuvable'],
    ['P2003', 500, 'Erreur interne du serveur'],
  ])('maps %s to HTTP %i', (code, status, message) => {
    const { host, response } = mockHost();

    filter.catch(prismaError(code), host);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: status, message }),
    );
  });
});
