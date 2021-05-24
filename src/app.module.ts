import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from '@config/app/config.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), AppConfigModule, AuthModule],
})
export class AppModule {}
