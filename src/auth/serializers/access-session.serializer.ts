import { Injectable } from '@nestjs/common';
import { BaseSerializerService } from '@common/serializers/base.serializer';
import { AccessSession as AccessSessionPrisma } from '@prisma/client';
import { AccessSession as AccessSessionProto } from 'cryptomath-api-proto/types/auth';
import { getUnixTime } from 'date-fns';

@Injectable()
export class AccessSessionSerializerService extends BaseSerializerService<
  AccessSessionPrisma,
  AccessSessionProto
> {
  async serialize(
    accessSession: AccessSessionPrisma,
  ): Promise<AccessSessionProto> {
    return {
      id: accessSession.id,
      createdAt: getUnixTime(accessSession.createdAt),
      updatedAt: getUnixTime(accessSession.updatedAt),
    };
  }
}
