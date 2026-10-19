import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /** Used to check connectivity from the phone. */
  @Get()
  check() {
    return { status: 'ok' };
  }
}
