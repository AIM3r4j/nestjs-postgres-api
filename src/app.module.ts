import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'utils/validators/env.validation';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FormatResponseInterceptor } from '../utils/custom_interceptors/response.interceptor';
import { JwtAuthExceptionFilter } from 'utils/custom_exception_filters/jwt_auth_exception.filter';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: JwtAuthExceptionFilter,
    },
  ],
})
export class AppModule {}
