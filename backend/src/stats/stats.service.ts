import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoodTag, Role } from '../generated/prisma/client.js';
import {
  addDays,
  isWorkingDay,
  todayParis,
  toIsoDate,
} from '../common/utils/date.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  DailyStatDto,
  TagCountDto,
  TeamStatsDto,
} from './dto/team-stats.dto.js';

const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/** The 3 most cited tags, most frequent first. */
function topTags(moods: { tags: MoodTag[] }[]): TagCountDto[] {
  const counts = new Map<MoodTag, number>();
  for (const mood of moods) {
    for (const tag of mood.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 3);
}

@Injectable()
export class StatsService {
  private readonly threshold: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.threshold = Number(config.get('MIN_RESPONSES_PER_DAY', 3));
  }

  /**
   * Aggregates computed server-side: the manager never receives a raw mood.
   * Days with fewer answers than the threshold are hidden.
   */
  async getTeamStats(teamId: string, days: number): Promise<TeamStatsDto> {
    const to = todayParis();
    const from = addDays(to, -(days - 1));

    const [team, employeeCount, moods] = await Promise.all([
      this.prisma.team.findUniqueOrThrow({
        where: { id: teamId },
        select: { id: true, name: true },
      }),
      this.prisma.user.count({ where: { teamId, role: Role.EMPLOYEE } }),
      this.prisma.mood.findMany({
        where: { teamId, day: { gte: from, lte: to } },
        select: { score: true, tags: true, day: true },
      }),
    ]);

    const scoresByDay = new Map<string, number[]>();
    for (const mood of moods) {
      const date = toIsoDate(mood.day);
      scoresByDay.set(date, [...(scoresByDay.get(date) ?? []), mood.score]);
    }

    // One entry per day of the period, so the front can draw a continuous axis
    const daily: DailyStatDto[] = [];
    const visibleScores: number[] = [];
    let workingDays = 0;
    for (let offset = 0; offset < days; offset++) {
      const day = addDays(from, offset);
      const scores = scoresByDay.get(toIsoDate(day)) ?? [];
      const hidden = scores.length < this.threshold;

      if (isWorkingDay(day)) workingDays++;
      if (!hidden) visibleScores.push(...scores);

      daily.push({
        date: toIsoDate(day),
        average: hidden ? null : round(mean(scores), 1),
        responses: hidden ? null : scores.length,
        hidden,
      });
    }

    const enoughAnswers = moods.length >= this.threshold;
    const expectedAnswers = employeeCount * workingDays;

    return {
      team: { ...team, employeeCount },
      period: { from: toIsoDate(from), to: toIsoDate(to), days },
      threshold: this.threshold,
      daily,
      summary: {
        // Hidden days are left out: otherwise their average could be deduced
        // from this global average and the visible daily values
        average:
          enoughAnswers && visibleScores.length > 0
            ? round(mean(visibleScores), 1)
            : null,
        participationRate:
          expectedAnswers > 0 ? round(moods.length / expectedAnswers, 2) : 0,
        topTags: enoughAnswers ? topTags(moods) : null,
        topConcerns: enoughAnswers
          ? topTags(moods.filter((mood) => mood.score <= 2))
          : null,
      },
    };
  }
}
