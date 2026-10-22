import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TeamWeatherDto } from './dto/team-weather.dto.js';
import { StatsService } from './stats.service.js';

/**
 * Open to employees and managers, unlike StatsController.
 * The team always comes from the token.
 */
@ApiTags('stats')
@ApiBearerAuth()
@Controller('team-weather')
export class WeatherController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOkResponse({ type: TeamWeatherDto })
  @ApiUnauthorizedResponse({ description: 'Token absent, invalide ou expiré' })
  getTeamWeather(@CurrentUser() user: AuthUser): Promise<TeamWeatherDto> {
    return this.statsService.getTeamWeather(user.teamId);
  }
}
