import { Controller } from '@nestjs/common';
import {
  AuthServiceControllerMethods,
  AuthServiceController,
  CreateAccessSessionRequest,
  CreateAccessSessionResponse,
  ValidateAccessSessionRequest,
  ValidateAccessSessionResponse,
  DeleteAccessSessionRequest,
  DeleteAccessSessionResponse,
  ValidateRefreshSessionRequest,
  ValidateRefreshSessionResponse,
  DeleteRefreshSessionRequest,
  DeleteRefreshSessionResponse,
  DeleteAllUserSessionsRequest,
  DeleteAllUserSessionsResponse,
} from 'cryptomath-api-proto/types/auth';
import { AuthService } from './auth.service';
import { AccessSessionSerializerService } from './serializers/access-session.serializer';
import { RefreshSessionSerializerService } from './serializers/refresh-session.serializer';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly accessSessionSerializerService: AccessSessionSerializerService,
    private readonly refreshSessionSerializerService: RefreshSessionSerializerService,
  ) {}

  async createAccessSession({
    userId,
    ip,
    userAgent,
  }: CreateAccessSessionRequest): Promise<CreateAccessSessionResponse> {
    await this.authService.deleteAccessSession(userId);

    const [
      isAccessSessionCreated,
      accessSessionResponse,
    ] = await this.authService.createAccessSession(userId);

    if (!isAccessSessionCreated) {
      return {
        isAccessSessionCreated: false,
        isRefreshSessionCreated: false,
        accessSessionId: null,
        accessSecret: '',
        refreshSessionId: null,
        refreshSecret: '',
      };
    }

    const { accessSecret, id: accessSessionId } = accessSessionResponse;

    const [
      isRefreshSessionCreated,
      refreshSession,
    ] = await this.authService.createRefreshSession(
      userId,
      accessSecret,
      ip,
      userAgent,
    );

    if (!isRefreshSessionCreated) {
      return {
        isAccessSessionCreated: true,
        isRefreshSessionCreated: false,
        accessSessionId,
        accessSecret: '',
        refreshSessionId: null,
        refreshSecret: '',
      };
    }

    const { refreshSecret, id: refreshSessionId } = refreshSession;

    return {
      isAccessSessionCreated: true,
      isRefreshSessionCreated: true,
      accessSessionId,
      accessSecret,
      refreshSessionId,
      refreshSecret,
    };
  }

  async validateAccessSession({
    userId,
    accessSecret,
  }: ValidateAccessSessionRequest): Promise<ValidateAccessSessionResponse> {
    const [
      isAccessSessionExists,
      accessSession,
    ] = await this.authService.findAccessSessionByUserAndSecret(
      userId,
      accessSecret,
    );

    if (!isAccessSessionExists) {
      return {
        isSessionExists: false,
        isSessionExpired: false,
        accessSession: null,
      };
    }

    const isSessionExpired = this.authService.checkAccessSessionExpiration(
      accessSession,
    );

    if (isSessionExpired) {
      return {
        isSessionExists: true,
        isSessionExpired: true,
        accessSession: null,
      };
    }

    return {
      isSessionExists: true,
      isSessionExpired: false,
      accessSession: await this.accessSessionSerializerService.serialize(
        accessSession,
      ),
    };
  }

  async validateRefreshSession({
    userId,
    refreshSecret,
  }: ValidateRefreshSessionRequest): Promise<ValidateRefreshSessionResponse> {
    const [
      isRefreshSessionExists,
      refreshSession,
    ] = await this.authService.findRefreshSessionByUserAndSecret(
      userId,
      refreshSecret,
    );

    if (!isRefreshSessionExists) {
      return {
        isSessionExists: false,
        isSessionExpired: false,
        refreshSession: null,
      };
    }

    const isSessionExpired = this.authService.checkRefreshSessionExpiration(
      refreshSession,
    );

    if (isSessionExpired) {
      return {
        isSessionExists: true,
        isSessionExpired: true,
        refreshSession: null,
      };
    }

    return {
      isSessionExists: true,
      isSessionExpired: false,
      refreshSession: await this.refreshSessionSerializerService.serialize(
        refreshSession,
      ),
    };
  }

  async deleteAccessSession({
    userId,
  }: DeleteAccessSessionRequest): Promise<DeleteAccessSessionResponse> {
    const [
      isSessionDeleted,
      accessSession,
    ] = await this.authService.deleteAccessSession(userId);

    if (!isSessionDeleted) {
      return {
        isSessionDeleted: false,
        accessSession: null,
      };
    }

    return {
      isSessionDeleted: true,
      accessSession: await this.accessSessionSerializerService.serialize(
        accessSession,
      ),
    };
  }

  async deleteRefreshSession({
    userId,
    refreshSecret,
  }: DeleteRefreshSessionRequest): Promise<DeleteRefreshSessionResponse> {
    const [
      isSessionDeleted,
      refreshSession,
    ] = await this.authService.deleteRefreshSession(userId, refreshSecret);

    if (!isSessionDeleted) {
      return {
        isSessionDeleted: false,
        refreshSession: null,
      };
    }

    return {
      isSessionDeleted: true,
      refreshSession: await this.refreshSessionSerializerService.serialize(
        refreshSession,
      ),
    };
  }

  async deleteAllUserSessions({
    userId,
  }: DeleteAllUserSessionsRequest): Promise<DeleteAllUserSessionsResponse> {
    const isSessionsDeleted = await this.authService.deleteAllUserSessions(
      userId,
    );

    return { isSessionsDeleted };
  }
}
