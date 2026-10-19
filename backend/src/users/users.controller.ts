import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Token absent, invalide ou expiré' })
  async getMe(@CurrentUser() user: AuthUser): Promise<UserProfileDto> {
    const profile = await this.usersService.findProfile(user.userId);
    // Valid token but the account no longer exists
    if (!profile) {
      throw new UnauthorizedException('Session invalide ou expirée');
    }
    return profile;
  }
}
