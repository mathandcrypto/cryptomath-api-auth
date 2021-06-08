import { Module } from '@nestjs/common';
import { PrismaModule } from '@providers/prisma/prisma.module';
import { AuthConfigModule } from '@config/auth/config.module';
import { EncryptionModule } from '@encryption/encryption.module';
import { AuthController } from './auth.controller';
import { AccessSessionSerializerService } from './serializers/access-session.serializer';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, AuthConfigModule, EncryptionModule],
  controllers: [AuthController],
  providers: [AccessSessionSerializerService, AuthService],
})
export class AuthModule {}
