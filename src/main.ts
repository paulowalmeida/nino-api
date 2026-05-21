import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.use(cookieParser())
  app.useGlobalInterceptors(new LoggingInterceptor())

  const config = new DocumentBuilder()
    .setTitle('Nino API')
    .setDescription('SaaS white-label de delivery')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3000)
  const port = process.env.PORT ?? 3000
  console.log(`Nino API is running on port ${port} 🐱🐱!!`)
}
void bootstrap()
