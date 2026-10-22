import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const MESSAGE_MAX_LENGTH = 280;

/** Only the text: the team always comes from the token. */
export class PublishTeamMessageDto {
  @ApiProperty({
    maxLength: MESSAGE_MAX_LENGTH,
    example:
      'Merci pour vos retours sur la charge de travail. On décale la prochaine livraison d’une semaine.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Le message doit être un texte' })
  @IsNotEmpty({ message: 'Le message ne peut pas être vide' })
  @MaxLength(MESSAGE_MAX_LENGTH, {
    message: `Le message ne peut pas dépasser ${MESSAGE_MAX_LENGTH} caractères`,
  })
  content: string;
}
