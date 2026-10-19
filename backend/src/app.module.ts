import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { HealthModule } from './health/health.module.js';
import { MoodsModule } from './moods/moods.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StatsModule } from './stats/stats.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MoodsModule,
    StatsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
