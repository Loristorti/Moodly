import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Public fields of a user: never includes passwordHash. */
const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  team: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{
  select: typeof profileSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Used by the login only: includes the password hash and team id. */
  findByEmailWithCredentials(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { ...profileSelect, passwordHash: true, teamId: true },
    });
  }

  /**
   * GDPR: deletes the account and its check-ins (cascade).
   * Moods are kept: they are anonymous and not personal data.
   */
  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  findProfile(userId: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
  }
}
