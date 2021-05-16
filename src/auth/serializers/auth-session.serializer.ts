import { Injectable } from '@nestjs/common';
import { BaseSerializerService } from '@common/serializers/base.serializer';
import { AuthSession as AuthSessionPrisma } from '@prisma/client';
import { AuthSession as AuthSessionProto } from 'cryptomath-api-proto/proto/build/auth';

@Injectable()
export class AuthSessionSerializerService extends BaseSerializerService<
  AuthSessionPrisma,
  AuthSessionProto
> {
  async serialize(authSession: AuthSessionPrisma): Promise<AuthSessionProto> {
    return {
      id: authSession.id,
      createdAt: authSession.createdAt,
      updatedAt: authSession.updatedAt,
    };
  }
}
