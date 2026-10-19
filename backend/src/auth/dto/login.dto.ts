import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@moodly.dev' })
  @IsEmail({}, { message: "L'adresse email n'est pas valide" })
  email: string;

  @ApiProperty({ example: 'Moodly2026!' })
  @IsString({ message: 'Le mot de passe doit être un texte' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}
