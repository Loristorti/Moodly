import { ApiProperty } from '@nestjs/swagger';
import { MoodTag } from '../../generated/prisma/client.js';

export class StatsTeamDto {
  @ApiProperty({ example: '9fecd689-87b6-4066-8945-5e28d763763c' })
  id: string;

  @ApiProperty({ example: 'Équipe Produit' })
  name: string;

  @ApiProperty({ example: 6 })
  employeeCount: number;
}

export class StatsPeriodDto {
  @ApiProperty({ example: '2026-09-20' })
  from: string;

  @ApiProperty({ example: '2026-10-19' })
  to: string;

  @ApiProperty({ example: 30 })
  days: number;
}

export class DailyStatDto {
  @ApiProperty({ example: '2026-09-21' })
  date: string;

  @ApiProperty({ type: Number, nullable: true, example: 3.6 })
  average: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 5 })
  responses: number | null;

  @ApiProperty({
    example: false,
    description:
      'true si moins de réponses que le seuil : moyenne et nombre masqués',
  })
  hidden: boolean;
}

export class TagCountDto {
  @ApiProperty({ enum: MoodTag, example: MoodTag.WORKLOAD })
  tag: MoodTag;

  @ApiProperty({ example: 12 })
  count: number;
}

export class StatsSummaryDto {
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.4,
    description: 'Moyenne des jours visibles uniquement',
  })
  average: number | null;

  @ApiProperty({ example: 0.78 })
  participationRate: number;

  @ApiProperty({ type: [TagCountDto], nullable: true })
  topTags: TagCountDto[] | null;

  @ApiProperty({
    type: [TagCountDto],
    nullable: true,
    description:
      'Tags les plus cités quand la note est inférieure ou égale à 2',
  })
  topConcerns: TagCountDto[] | null;
}

export class TeamStatsDto {
  @ApiProperty({ type: StatsTeamDto })
  team: StatsTeamDto;

  @ApiProperty({ type: StatsPeriodDto })
  period: StatsPeriodDto;

  @ApiProperty({ example: 3 })
  threshold: number;

  @ApiProperty({ type: [DailyStatDto] })
  daily: DailyStatDto[];

  @ApiProperty({ type: StatsSummaryDto })
  summary: StatsSummaryDto;
}
