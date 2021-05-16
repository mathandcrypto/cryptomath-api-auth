import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get authSessionMaxAge(): number {
    return this.configService.get<number>('auth.authSessionMaxAge');
  }

  get authSessionExpirationDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() - this.authSessionMaxAge);

    return date;
  }

  get refreshSessionMaxAge(): number {
    return this.configService.get<number>('auth.refreshSessionMaxAge');
  }

  get refreshSessionExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - this.refreshSessionMaxAge);

    return date;
  }
}
