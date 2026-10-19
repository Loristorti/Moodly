import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** No teamId here on purpose: the team is always the one from the token. */
export class StatsQueryDto {
  @ApiPropertyOptional({ minimum: 7, maximum: 90, default: 30, example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Le nombre de jours doit être un entier' })
  @Min(7, { message: 'Le nombre de jours doit être compris entre 7 et 90' })
  @Max(90, { message: 'Le nombre de jours doit être compris entre 7 et 90' })
  days: number = 30;
}
