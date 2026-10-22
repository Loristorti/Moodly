import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoodTag } from '../../generated/prisma/client.js';
import { ALERT_TYPES, type AlertType } from '../insights.js';

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

export class AlertDto {
  @ApiProperty({
    enum: ALERT_TYPES,
    example: 'DECLINE',
    description:
      'DECLINE / IMPROVEMENT : la moyenne a baissé / monté par rapport à la période précédente ; CONCERN : un thème revient dans les réponses basses ; LOW_PARTICIPATION : moins de la moitié des réponses attendues',
  })
  type: AlertType;

  @ApiProperty({
    example: -0.4,
    description:
      'Écart de moyenne (DECLINE, IMPROVEMENT) ou proportion de 0 à 1 (CONCERN, LOW_PARTICIPATION)',
  })
  value: number;

  @ApiPropertyOptional({ enum: MoodTag, example: MoodTag.WORKLOAD })
  tag?: MoodTag;
}

export class StatsSummaryDto {
  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.4,
    description: 'Moyenne des jours visibles uniquement',
  })
  average: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 3.8,
    description:
      'Moyenne des jours visibles de la période précédente, de même durée',
  })
  previousAverage: number | null;

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

  @ApiProperty({
    type: [AlertDto],
    description: 'Au plus 3 points d’attention, le plus urgent en premier',
  })
  alerts: AlertDto[];
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
