import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { MoodTag } from '../../generated/prisma/client.js';

/** Only the score and tags: the team and the day are set by the server. */
export class CreateMoodDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @IsInt({ message: 'La note doit être un nombre entier' })
  @Min(1, { message: 'La note doit être comprise entre 1 et 5' })
  @Max(5, { message: 'La note doit être comprise entre 1 et 5' })
  score: number;

  @ApiProperty({
    enum: MoodTag,
    isArray: true,
    maxItems: 3,
    required: false,
    example: [MoodTag.WORKLOAD, MoodTag.TEAM_SPIRIT],
  })
  @IsOptional()
  @IsArray({ message: 'Les tags doivent être une liste' })
  @ArrayMaxSize(3, { message: 'Vous pouvez choisir au maximum 3 tags' })
  @ArrayUnique({ message: 'Un même tag ne peut être choisi qu’une fois' })
  @IsEnum(MoodTag, { each: true, message: 'Tag inconnu' })
  tags: MoodTag[] = [];
}
