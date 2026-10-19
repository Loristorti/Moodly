import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './auth-user.js';

/**
 * Hash of a random string, compared when the email is unknown so that the
 * response time does not reveal whether an account exists.
 */
const DUMMY_HASH =
  '$2b$10$bqpcGRsYWGaeXuBgwgmeVu16SJWWvNR.M2OXo.RAKYmtWVLZJA7ve';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmailWithCredentials(
      email.trim().toLowerCase(),
    );
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    // Same message whether the email exists or not
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      teamId: user.teamId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        team: user.team,
      },
    };
  }
}
