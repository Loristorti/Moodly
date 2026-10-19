import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { TeamStatsDto } from './dto/team-stats.dto.js';
import { StatsService } from './stats.service.js';

@ApiTags('stats')
@ApiBearerAuth()
@Roles('MANAGER')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** The team always comes from the token: a manager can only see their own team. */
  @Get('team')
  @ApiOkResponse({ type: TeamStatsDto })
  @ApiBadRequestResponse({
    description: 'days hors de 7 à 90, ou paramètre inconnu',
  })
  @ApiForbiddenResponse({ description: 'Réservé aux managers' })
  getTeamStats(
    @CurrentUser() user: AuthUser,
    @Query() query: StatsQueryDto,
  ): Promise<TeamStatsDto> {
    return this.statsService.getTeamStats(user.teamId, query.days);
  }
}
