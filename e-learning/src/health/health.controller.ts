import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

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
