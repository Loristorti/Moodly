import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TeamMessageDto } from './dto/team-message.dto.js';

const select = { content: true, updatedAt: true } as const;

/** One message per team, written by its manager. */
@Injectable()
export class TeamMessageService {
  constructor(private readonly prisma: PrismaService) {}

  find(teamId: string): Promise<TeamMessageDto | null> {
    return this.prisma.teamMessage.findUnique({ where: { teamId }, select });
  }

  /** Creates the message, or replaces the previous one */
  publish(teamId: string, content: string): Promise<TeamMessageDto> {
    return this.prisma.teamMessage.upsert({
      where: { teamId },
      create: { teamId, content },
      update: { content },
      select,
    });
  }

  /** No error if there was no message */
  async remove(teamId: string): Promise<void> {
    await this.prisma.teamMessage.deleteMany({ where: { teamId } });
  }
}
