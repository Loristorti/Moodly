import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { PublishTeamMessageDto } from './dto/publish-team-message.dto.js';
import {
  TeamMessageDto,
  TeamMessageResponseDto,
} from './dto/team-message.dto.js';
import { TeamMessageService } from './team-message.service.js';

// The team always comes from the token: nobody can read or write another team's message.
@ApiTags('team-message')
@ApiBearerAuth()
@Controller('team-message')
export class TeamMessageController {
  constructor(private readonly teamMessageService: TeamMessageService) {}

  @Get()
  @ApiOkResponse({ type: TeamMessageResponseDto })
  async get(@CurrentUser() user: AuthUser): Promise<TeamMessageResponseDto> {
    return { message: await this.teamMessageService.find(user.teamId) };
  }

  @Put()
  @Roles('MANAGER')
  @ApiOkResponse({ type: TeamMessageDto })
  @ApiBadRequestResponse({ description: 'Message vide ou trop long' })
  @ApiForbiddenResponse({ description: 'Réservé aux managers' })
  publish(
    @CurrentUser() user: AuthUser,
    @Body() dto: PublishTeamMessageDto,
  ): Promise<TeamMessageDto> {
    return this.teamMessageService.publish(user.teamId, dto.content);
  }

  @Delete()
  @Roles('MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Message retiré' })
  @ApiForbiddenResponse({ description: 'Réservé aux managers' })
  async remove(@CurrentUser() user: AuthUser): Promise<void> {
    await this.teamMessageService.remove(user.teamId);
  }
}
