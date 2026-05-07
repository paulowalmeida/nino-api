import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'

import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req
    const start = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const status = context.switchToHttp().getResponse().statusCode
          this.logger.log(`${method} ${url} ${status} ${Date.now() - start}ms`)
        },
        error: (err) => {
          const status = err.status ?? 500
          this.logger.error(
            `${method} ${url} ${status} ${Date.now() - start}ms`,
          )
        },
      }),
    )
  }
}
