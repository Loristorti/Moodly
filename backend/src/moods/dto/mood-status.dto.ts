import { ApiProperty } from '@nestjs/swagger';

export class MoodStatusDto {
  @ApiProperty({ example: true })
  submitted: boolean;
}
