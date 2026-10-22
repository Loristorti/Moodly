import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';
import { WeatherController } from './weather.controller.js';

@Module({
  controllers: [StatsController, WeatherController],
  providers: [StatsService],
})
export class StatsModule {}
