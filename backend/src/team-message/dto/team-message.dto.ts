import { ApiProperty } from '@nestjs/swagger';

export class TeamMessageDto {
  @ApiProperty({
    example:
      'Merci pour vos retours sur la charge de travail. On décale la prochaine livraison d’une semaine.',
  })
  content: string;

  @ApiProperty({ example: '2026-10-22T09:30:00.000Z' })
  updatedAt: Date;
}

export class TeamMessageResponseDto {
  @ApiProperty({
    type: TeamMessageDto,
    nullable: true,
    description: 'null si le manager n’a publié aucun message',
  })
  message: TeamMessageDto | null;
}
