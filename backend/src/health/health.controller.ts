import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  /** Used to check connectivity from the phone. */
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
