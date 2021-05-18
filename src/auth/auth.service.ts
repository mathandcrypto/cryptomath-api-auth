import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CreateAccessSessionResponse } from './interfaces/create-access-session-response.interface';
import { CreateRefreshSessionResponse } from './interfaces/create-refresh-session-response.interface';
import { AccessSession, RefreshSession } from '@prisma/client';
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

  async createAccessSession(
    userId: number,
  ): Promise<[boolean, CreateAccessSessionResponse]> {
    const accessSecret = await this.encryptionService.generateSecret(userId);

    try {
      const accessSession = await this.prisma.accessSession.create({
        data: {
          userId,
          accessSecret,
        },
      });

      return [
        true,
        {
          id: accessSession.id,
          accessSecret,
        },
      ];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async createRefreshSession(
    userId: number,
    accessSecret: string,
  ): Promise<[boolean, CreateRefreshSessionResponse]> {
    const refreshSecret = await this.encryptionService.generateSecret(
      userId,
      accessSecret,
      11,
    );

    try {
      const refreshSessionsCount = await this.prisma.refreshSession.count({
        where: { userId },
      });

      if (refreshSessionsCount >= this.authConfigService.maxRefreshSessions) {
        await this.prisma.refreshSession.deleteMany({
          where: { userId },
        });
      }

      const refreshSession = await this.prisma.refreshSession.create({
        data: { userId, refreshSecret },
      });

      return [
        true,
        {
          id: refreshSession.id,
          refreshSecret,
        },
      ];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async findAccessSessionByUserAndSecret(
    userId: number,
    accessSecret: string,
  ): Promise<[boolean, AccessSession]> {
    try {
      const accessSession = await this.prisma.accessSession.findFirst({
        where: {
          userId,
          accessSecret,
        },
      });

      if (!accessSession) {
        return [false, null];
      }

      return [true, accessSession];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async findRefreshSessionByUserAndSecret(
    userId: number,
    refreshSecret: string,
  ): Promise<[boolean, RefreshSession]> {
    try {
      const refreshSession = await this.prisma.refreshSession.findFirst({
        where: {
          userId,
          refreshSecret,
        },
      });

      if (!refreshSession) {
        return [false, null];
      }

      return [true, refreshSession];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  checkAccessSessionExpiration(accessSession: AccessSession): boolean {
    return (
      this.authConfigService.accessSessionExpirationDate.getTime() -
        accessSession.updatedAt.getTime() >
      0
    );
  }

  checkRefreshSessionExpiration(refreshSession: RefreshSession): boolean {
    return (
      this.authConfigService.refreshSessionExpirationDate.getTime() -
        refreshSession.createdAt.getTime() >
      0
    );
  }

  async findAccessSessionByUser(
    userId: number,
  ): Promise<[boolean, AccessSession]> {
    try {
      const accessSession = await this.prisma.accessSession.findUnique({
        where: { userId },
      });

      if (!accessSession) {
        return [false, null];
      }

      return [true, accessSession];
    } catch (error) {
      this.logger.error(error);

      return [false, null];
    }
  }

  async deleteAccessSession(userId: number): Promise<boolean> {
    try {
      await this.prisma.accessSession.delete({
        where: { userId },
      });

      return true;
    } catch (error) {
      if (error.code !== 'P2025') {
        this.logger.error(error);
      }

      return false;
    }
  }

  async deleteRefreshSession(
    userId: number,
    refreshSecret: string,
  ): Promise<boolean> {
    try {
      await this.prisma.refreshSession.deleteMany({
        where: { AND: [{ userId }, { refreshSecret }] },
      });

      return true;
    } catch (error) {
      if (error.code !== 'P2025') {
        this.logger.error(error);
      }

      return false;
    }
  }

  async deleteAllUserSessions(userId: number): Promise<boolean> {
    const deleteAccessSession = this.prisma.accessSession.delete({
      where: { userId },
    });

    const deleteRefreshSessions = this.prisma.refreshSession.deleteMany({
      where: { userId },
    });

    try {
      await this.prisma.$transaction([
        deleteAccessSession,
        deleteRefreshSessions,
      ]);

      return true;
    } catch (error) {
      this.logger.error(error);

      return false;
    }
  }

  @Cron('0 30 * * * *')
  async deleteExpiredAccessSessions() {
    try {
      const deleteAccessSessions = await this.prisma.accessSession.deleteMany({
        where: {
          updatedAt: {
            lte: this.authConfigService.accessSessionExpirationDate,
          },
        },
      });

      this.logger.log(
        `Deleted ${deleteAccessSessions.count} expired access sessions`,
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
            createdAt: {
              lte: this.authConfigService.refreshSessionExpirationDate,
            },
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
