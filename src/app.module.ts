import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
})
export class AppModule {}
