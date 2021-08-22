import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@providers/prisma/prisma.module';
import { AuthConfigModule } from '@config/auth/config.module';
import { AuthController } from './auth.controller';
import { AccessSessionSerializerService } from './serializers/access-session.serializer';
import { RefreshSessionSerializerService } from './serializers/refresh-session.serializer';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, AuthConfigModule],
  controllers: [AuthController],
  providers: [
    AccessSessionSerializerService,
    RefreshSessionSerializerService,
    AuthService,
    EncryptionService,
  ],
})
export class AuthModule {}
