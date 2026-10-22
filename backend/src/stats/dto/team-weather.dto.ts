import { ApiProperty } from '@nestjs/swagger';
import { WEATHER_TYPES, type WeatherType } from '../weather.js';

export class WeatherPeriodDto {
  @ApiProperty({ example: '2026-10-15' })
  from: string;

  @ApiProperty({ example: '2026-10-21' })
  to: string;
}

export class TeamWeatherDto {
  @ApiProperty({
    enum: WEATHER_TYPES,
    nullable: true,
    example: 'PARTLY_CLOUDY',
    description:
      'Météo de l’équipe sur les 7 jours avant aujourd’hui, calculée sur les jours visibles uniquement ; null s’il n’y a pas assez de réponses. Aucun chiffre n’est renvoyé.',
  })
  weather: WeatherType | null;

  @ApiProperty({ type: WeatherPeriodDto })
  period: WeatherPeriodDto;
}
