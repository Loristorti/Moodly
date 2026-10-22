import { Module } from '@nestjs/common';
import { TeamMessageController } from './team-message.controller.js';
import { TeamMessageService } from './team-message.service.js';

@Module({
  controllers: [TeamMessageController],
  providers: [TeamMessageService],
})
export class TeamMessageModule {}
