import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';
import { MoodStatusDto } from './dto/mood-status.dto.js';
import { MoodsService } from './moods.service.js';

// Anonymity: never log the body of these requests.
@ApiTags('moods')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Réservé aux employés' })
@Roles('EMPLOYEE')
@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Get('today')
  @ApiOkResponse({ type: MoodStatusDto })
  async today(@CurrentUser() user: AuthUser): Promise<MoodStatusDto> {
    return {
      submitted: await this.moodsService.hasSubmittedToday(user.userId),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: MoodStatusDto })
  @ApiBadRequestResponse({ description: 'Note ou tags invalides' })
  @ApiConflictResponse({ description: 'Humeur déjà renseignée aujourd’hui' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMoodDto,
  ): Promise<MoodStatusDto> {
    await this.moodsService.submit(user, dto);
    // Nothing identifying in the response
    return { submitted: true };
  }
}
