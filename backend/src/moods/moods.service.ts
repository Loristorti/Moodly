import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import type { AuthUser } from '../auth/auth-user.js';
import { todayParis } from '../common/utils/date.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';

const PURGE_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class MoodsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MoodsService.name);
  private purgeTimer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * A CheckIn is only needed on its own day (to block a second answer).
   * Past CheckIns are deleted at startup, on every answer and every hour, so that
   * nothing can link a person to a mood afterwards (not even PostgreSQL's
   * internal transaction ids, since the CheckIn row no longer exists).
   */
  async onModuleInit() {
    await this.purgePastCheckIns();
    this.purgeTimer = setInterval(
      () => void this.purgePastCheckIns(),
      PURGE_INTERVAL_MS,
    );
    this.purgeTimer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.purgeTimer);
  }

  async purgePastCheckIns(): Promise<number> {
    const { count } = await this.prisma.checkIn.deleteMany({
      where: { day: { lt: todayParis() } },
    });
    if (count > 0) {
      // Only a number of rows, never who or when
      this.logger.log(`Deleted ${count} past check-ins`);
    }
    return count;
  }

  /**
   * Records today's mood anonymously, in a single transaction:
   * 1. past CheckIns are deleted (see purgePastCheckIns);
   * 2. the CheckIn (userId + day) prevents a second answer the same day;
   * 3. the Mood is stored with the team and the day only, with no link to the user.
   */
  async submit(user: AuthUser, dto: CreateMoodDto): Promise<void> {
    const day = todayParis();

    try {
      await this.prisma.$transaction([
        this.prisma.checkIn.deleteMany({ where: { day: { lt: day } } }),
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
