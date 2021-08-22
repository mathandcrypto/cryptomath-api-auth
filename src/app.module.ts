import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/app/config.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [AppConfigModule, AuthModule],
})
export class AppModule {}
