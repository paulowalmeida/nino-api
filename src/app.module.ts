import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { join } from 'path';

import { AuthModule } from '@auth/auth.module';
import { PrismaModule } from '@shared/services/prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env')
    }),
    AuthModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
