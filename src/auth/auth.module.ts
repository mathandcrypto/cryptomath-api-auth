import { Module } from '@nestjs/common';
import { PrismaModule } from '@providers/prisma/prisma.module';
import { AuthConfigModule } from '@config/auth/config.module';
import { EncryptionModule } from '@encryption/encryption.module';
import { AuthController } from './auth.controller';
import { AuthSessionSerializerService } from './serializers/auth-session.serializer';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, AuthConfigModule, EncryptionModule],
  controllers: [AuthController],
  providers: [AuthSessionSerializerService, AuthService],
})
export class AuthModule {}
