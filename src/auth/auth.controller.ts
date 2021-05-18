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
} from 'cryptomath-api-proto/proto/build/auth';
import { AuthService } from './auth.service';
import { AccessSessionSerializerService } from './serializers/access-session.serializer';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly accessSessionSerializerService: AccessSessionSerializerService,
  ) {}

  async createAccessSession({
    userId,
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
        accessSecret: '',
        refreshSecret: '',
      };
    }

    const { accessSecret } = accessSessionResponse;

    const [
      isRefreshSessionCreated,
      refreshSession,
    ] = await this.authService.createRefreshSession(userId, accessSecret);

    if (!isRefreshSessionCreated) {
      return {
        isAccessSessionCreated: true,
        isRefreshSessionCreated: false,
        accessSecret: '',
        refreshSecret: '',
      };
    }

    const { refreshSecret } = refreshSession;

    return {
      isAccessSessionCreated: true,
      isRefreshSessionCreated: true,
      accessSecret,
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
      };
    }

    const isSessionExpired = this.authService.checkRefreshSessionExpiration(
      refreshSession,
    );

    if (isSessionExpired) {
      return {
        isSessionExists: true,
        isSessionExpired: true,
      };
    }

    return {
      isSessionExists: true,
      isSessionExpired: false,
    };
  }

  async deleteAccessSession({
    userId,
  }: DeleteAccessSessionRequest): Promise<DeleteAccessSessionResponse> {
    const isSessionDeleted = await this.authService.deleteAccessSession(userId);

    return { isSessionDeleted };
  }

  async deleteRefreshSession({
    userId,
    refreshSecret,
  }: DeleteRefreshSessionRequest): Promise<DeleteRefreshSessionResponse> {
    const isSessionDeleted = await this.authService.deleteRefreshSession(
      userId,
      refreshSecret,
    );

    return { isSessionDeleted };
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
