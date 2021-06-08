import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { AuthConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        ACCESS_SESSION_MAX_AGE: Joi.number().min(1).max(60),
        REFRESH_SESSION_MAX_AGE: Joi.number().min(1).max(30),
        MAX_REFRESH_SESSIONS: Joi.number().default(5),
      }),
    }),
  ],
  providers: [ConfigService, AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
