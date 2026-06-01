import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'

import { PrismaService } from '@shared/services/prisma/prisma.service'

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.pingDatabase()])
  }

  private async pingDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { database: { status: 'up' } }
    } catch {
      throw new HealthCheckError('database', { database: { status: 'down' } })
    }
  }
}
