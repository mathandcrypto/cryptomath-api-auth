import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CreateAuthSessionResponse } from './interfaces/create-auth-session-response.interface';
import { AuthSession } from '@prisma/client';
import { PrismaService } from '@providers/prisma/prisma.service';
import { EncryptionService } from '@encryption/encryption.service';
import { AuthConfigService } from '@config/auth/config.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async createAuthSession(
    userId: number,
  ): Promise<[boolean, CreateAuthSessionResponse]> {
    const accessSecret = await this.encryptionService.generateSecret(userId);
    const refreshSecret = await this.encryptionService.generateSecret(
      userId,
      accessSecret,
      11,
    );

    try {
      const auth = await this.prisma.authSession.create({
        data: {
          userId,
          accessSecret,
          refreshSessions: {
            create: [{ refreshSecret }],
          },
        },
      });

      return [
        true,
        {
          id: auth.id,
          accessSecret,
          refreshSecret,
        },
      ];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async findAuthSessionByUserAndSecret(
    userId: number,
    accessSecret: string,
  ): Promise<[boolean, AuthSession]> {
    try {
      const authSession = await this.prisma.authSession.findFirst({
        where: {
          userId,
          accessSecret,
        },
      });

      if (!authSession) {
        return [false, null];
      }

      return [true, authSession];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  checkAuthSessionExpiration(authSession: AuthSession): boolean {
    return (
      this.authConfigService.authSessionExpirationDate.getTime() -
        authSession.updatedAt.getTime() >
      0
    );
  }

  async findAuthSessionByUser(userId: number): Promise<[boolean, AuthSession]> {
    try {
      const authSession = await this.prisma.authSession.findUnique({
        where: { userId },
      });

      if (!authSession) {
        return [false, null];
      }

      return [true, authSession];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async deleteAuthSession(userId: number): Promise<boolean> {
    const [isSessionExists, authSession] = await this.findAuthSessionByUser(
      userId,
    );

    if (isSessionExists) {
      const deleteRefreshSessions = this.prisma.refreshSession.deleteMany({
        where: {
          authSessionId: authSession.id,
        },
      });

      const deleteAuthSession = this.prisma.authSession.delete({
        where: {
          id: authSession.id,
        },
      });

      try {
        await this.prisma.$transaction([
          deleteRefreshSessions,
          deleteAuthSession,
        ]);
      } catch (error) {
        this.logger.error(error);

        return false;
      }
    }

    return true;
  }

  @Cron('0 30 * * * *')
  async deleteExpiredAuthSessions() {
    try {
      const deleteAuthSessions = await this.prisma.authSession.deleteMany({
        where: {
          updatedAt: {
            lte: this.authConfigService.refreshSessionExpirationDate,
          },
        },
      });

      this.logger.log(
        `Deleted ${deleteAuthSessions.count} expired auth sessions`,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 60 * * * *')
  async deleteExpiredRefreshSessions() {
    try {
      const deleteRefreshSessions = await this.prisma.refreshSession.deleteMany(
        {
          where: {
            OR: [
              {
                createdAt: {
                  lte: this.authConfigService.refreshSessionExpirationDate,
                },
              },
              {
                authSessionId: {
                  equals: null,
                },
              },
            ],
          },
        },
      );

      this.logger.log(
        `Deleted ${deleteRefreshSessions.count} expired refresh sessions`,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
