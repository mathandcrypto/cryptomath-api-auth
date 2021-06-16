import { Injectable } from '@nestjs/common';
import { BaseSerializerService } from '@common/serializers/base.serializer';
import { RefreshSession as RefreshSessionPrisma } from '@prisma/client';
import { RefreshSession as RefreshSessionProto } from 'cryptomath-api-proto/types/auth';

@Injectable()
export class RefreshSessionSerializerService extends BaseSerializerService<
  RefreshSessionPrisma,
  RefreshSessionProto
> {
  async serialize(
    refreshSession: RefreshSessionPrisma,
  ): Promise<RefreshSessionProto> {
    return {
      id: refreshSession.id,
      ip: refreshSession.ip,
      userAgent: refreshSession.userAgent,
      createdAt: refreshSession.createdAt,
    };
  }
}
