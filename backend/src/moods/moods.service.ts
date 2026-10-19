import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import type { AuthUser } from '../auth/auth-user.js';
import { todayParis } from '../common/utils/date.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';

@Injectable()
export class MoodsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records today's mood anonymously, in a single transaction:
   * 1. the CheckIn (userId + day) prevents a second answer the same day;
   * 2. the Mood is stored with the team and the day only, with no link to the user.
   */
  async submit(user: AuthUser, dto: CreateMoodDto): Promise<void> {
    const day = todayParis();

    try {
      await this.prisma.$transaction([
        this.prisma.checkIn.create({ data: { userId: user.userId, day } }),
        this.prisma.mood.create({
          data: { score: dto.score, tags: dto.tags, day, teamId: user.teamId },
        }),
      ]);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Vous avez déjà renseigné votre humeur aujourd’hui',
        );
      }
      throw error;
    }
  }

  async hasSubmittedToday(userId: string): Promise<boolean> {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { userId_day: { userId, day: todayParis() } },
    });
    return checkIn !== null;
  }
}
