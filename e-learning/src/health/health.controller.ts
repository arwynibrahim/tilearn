import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

// Never rate-limit the healthcheck — it must stay reachable even if the
// throttler's Redis backend (REDIS_URL) is slow or unreachable, otherwise
// Railway would mark the container unhealthy and restart it.
@SkipThrottle()
@ApiExcludeController()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Liveness — used by Railway healthcheck. No DB dependency so the
  // container is reported healthy as soon as the HTTP server is up.
  @Get()
  check() {
    return { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() };
  }

  // Readiness — verifies the database connection is usable.
  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready' };
  }
}
