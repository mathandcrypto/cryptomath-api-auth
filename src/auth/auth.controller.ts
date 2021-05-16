import { Controller } from '@nestjs/common';
import {
  AuthServiceControllerMethods,
  AuthServiceController,
  CreateAuthSessionRequest,
  CreateAuthSessionResponse,
  ValidateAuthSessionRequest,
  ValidateAuthSessionResponse,
  DeleteAuthSessionResponse,
} from 'cryptomath-api-proto/proto/build/auth';
import { AuthService } from './auth.service';
import { AuthSessionSerializerService } from './serializers/auth-session.serializer';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionSerializerService: AuthSessionSerializerService,
  ) {}

  async createAuthSession({
    userId,
  }: CreateAuthSessionRequest): Promise<CreateAuthSessionResponse> {
    await this.authService.deleteAuthSession(userId);

    const [
      isAuthSessionCreated,
      authSessionResponse,
    ] = await this.authService.createAuthSession(userId);

    if (!isAuthSessionCreated) {
      return {
        isSessionCreated: false,
        accessSecret: '',
        refreshSecret: '',
      };
    }

    const { accessSecret, refreshSecret } = authSessionResponse;

    return {
      isSessionCreated: true,
      accessSecret,
      refreshSecret,
    };
  }

  async validateAuthSession({
    userId,
    accessSecret,
  }: ValidateAuthSessionRequest): Promise<ValidateAuthSessionResponse> {
    const [
      isAuthSessionExists,
      authSession,
    ] = await this.authService.findAuthSessionByUserAndSecret(
      userId,
      accessSecret,
    );

    if (!isAuthSessionExists) {
      return {
        isSessionExists: false,
        isSessionExpired: false,
        authSession: null,
      };
    }

    const isSessionExpired = this.authService.checkAuthSessionExpiration(
      authSession,
    );

    if (isSessionExpired) {
      return {
        isSessionExists: true,
        isSessionExpired: true,
        authSession: null,
      };
    }

    return {
      isSessionExists: true,
      isSessionExpired: false,
      authSession: await this.authSessionSerializerService.serialize(
        authSession,
      ),
    };
  }

  async deleteAuthSession({
    userId,
  }: CreateAuthSessionRequest): Promise<DeleteAuthSessionResponse> {
    const isSessionDeleted = await this.authService.deleteAuthSession(userId);

    return { isSessionDeleted };
  }
}
