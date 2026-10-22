import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoodTag, Role } from '../generated/prisma/client.js';
import {
  addDays,
  isWorkingDay,
  todayParis,
  toIsoDate,
} from '../common/utils/date.js';
import { round } from '../common/utils/round.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  DailyStatDto,
  TagCountDto,
  TeamStatsDto,
} from './dto/team-stats.dto.js';
import { TeamWeatherDto } from './dto/team-weather.dto.js';
import { buildAlerts } from './insights.js';
import { weatherFor } from './weather.js';

/** The weather covers the last 7 days, today excluded */
const WEATHER_DAYS = 7;

/** Average and number of answers of one day, computed by the database. */
interface DayGroup {
  day: Date;
  average: number;
  answers: number;
}

const toDayGroup = (group: {
  day: Date;
  _avg: { score: number | null };
  _count: { _all: number };
}): DayGroup => ({
  day: group.day,
  average: group._avg.score ?? 0,
  answers: group._count._all,
});

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
   * Weather of the team over the 7 days before today, for employees and managers.
   * Today is left out, so that nobody can compare the weather before and after
   * their own answer, and only a category is returned, never a number.
   */
  async getTeamWeather(teamId: string): Promise<TeamWeatherDto> {
    const to = addDays(todayParis(), -1);
    const from = addDays(to, -(WEATHER_DAYS - 1));

    const groups = await this.prisma.mood.groupBy({
      by: ['day'],
      where: { teamId, day: { gte: from, lte: to } },
      _avg: { score: true },
      _count: { _all: true },
    });

    return {
      weather: weatherFor(this.visibleAverage(groups.map(toDayGroup))),
      period: { from: toIsoDate(from), to: toIsoDate(to) },
    };
  }

  /**
   * Aggregates computed server-side: the manager never receives a raw mood.
   * Days with fewer answers than the threshold are hidden.
   */
  async getTeamStats(teamId: string, days: number): Promise<TeamStatsDto> {
    const to = todayParis();
    const from = addDays(to, -(days - 1));
    const period = { teamId, day: { gte: from, lte: to } };
    // The same number of days just before, to show the trend
    const previousPeriod = {
      teamId,
      day: { gte: addDays(from, -days), lte: addDays(from, -1) },
    };

    const [team, employeeCount, groups, previousGroups, tagRows] =
      await Promise.all([
        this.prisma.team.findUniqueOrThrow({
          where: { id: teamId },
          select: { id: true, name: true },
        }),
        this.prisma.user.count({ where: { teamId, role: Role.EMPLOYEE } }),
        this.prisma.mood.groupBy({
          by: ['day'],
          where: period,
          _avg: { score: true },
          _count: { _all: true },
        }),
        this.prisma.mood.groupBy({
          by: ['day'],
          where: previousPeriod,
          _avg: { score: true },
          _count: { _all: true },
        }),
        // Tags are lists: Prisma cannot group them, so they are counted here
        this.prisma.mood.findMany({
          where: period,
          select: { score: true, tags: true },
        }),
      ]);

    const dayGroups = groups.map(toDayGroup);
    const totalAnswers = dayGroups.reduce((sum, g) => sum + g.answers, 0);
    const enoughAnswers = totalAnswers >= this.threshold;
    const lowAnswers = tagRows.filter((row) => row.score <= 2);

    const average = enoughAnswers ? this.visibleAverage(dayGroups) : null;
    // Visible days only, like the average: no hidden day can be deduced from it
    const previousAverage = this.visibleAverage(previousGroups.map(toDayGroup));
    const participationRate = this.participationRate(
      totalAnswers,
      employeeCount,
      from,
      days,
    );

    return {
      team: { ...team, employeeCount },
      period: { from: toIsoDate(from), to: toIsoDate(to), days },
      threshold: this.threshold,
      daily: this.buildDaily(from, days, dayGroups),
      summary: {
        average,
        previousAverage,
        participationRate,
        topTags: enoughAnswers ? this.topTags(tagRows) : null,
        topConcerns: enoughAnswers ? this.topTags(lowAnswers) : null,
        alerts: buildAlerts({
          average,
          previousAverage,
          participationRate,
          lowAnswerTags: lowAnswers.map((row) => row.tags),
          threshold: this.threshold,
        }),
      },
    };
  }

  private isHidden(answers: number): boolean {
    return answers < this.threshold;
  }

  /** One entry per day of the period, so the front can draw a continuous axis. */
  private buildDaily(
    from: Date,
    days: number,
    dayGroups: DayGroup[],
  ): DailyStatDto[] {
    const byDate = new Map(dayGroups.map((g) => [toIsoDate(g.day), g]));

    return Array.from({ length: days }, (_, offset) => {
      const date = toIsoDate(addDays(from, offset));
      const group = byDate.get(date);
      const hidden = !group || this.isHidden(group.answers);

      return {
        date,
        average: hidden ? null : round(group.average, 1),
        responses: hidden ? null : group.answers,
        hidden,
      };
    });
  }

  /**
   * Average of the visible days only: if hidden days were included, their
   * average could be deduced from this value and the visible daily values.
   */
  private visibleAverage(dayGroups: DayGroup[]): number | null {
    const visible = dayGroups.filter((g) => !this.isHidden(g.answers));
    const answers = visible.reduce((sum, g) => sum + g.answers, 0);
    if (answers === 0) {
      return null;
    }
    const scoreSum = visible.reduce((sum, g) => sum + g.average * g.answers, 0);
    return round(scoreSum / answers, 1);
  }

  /** Answers ÷ (employees × working days of the period, Monday to Friday). */
  private participationRate(
    totalAnswers: number,
    employeeCount: number,
    from: Date,
    days: number,
  ): number {
    const workingDays = Array.from({ length: days }, (_, offset) =>
      addDays(from, offset),
    ).filter(isWorkingDay).length;
    const expectedAnswers = employeeCount * workingDays;
    return expectedAnswers > 0 ? round(totalAnswers / expectedAnswers, 2) : 0;
  }

  /** The 3 most cited tags, most frequent first. */
  private topTags(rows: { tags: MoodTag[] }[]): TagCountDto[] {
    const counts = new Map<MoodTag, number>();
    for (const tag of rows.flatMap((row) => row.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 3);
  }
}
