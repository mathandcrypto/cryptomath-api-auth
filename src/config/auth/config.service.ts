import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get accessSessionMaxAge(): number {
    return this.configService.get<number>('auth.accessSessionMaxAge');
  }

  get accessSessionExpirationDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() - this.accessSessionMaxAge);

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

  get maxRefreshSessions(): number {
    return this.configService.get<number>('auth.maxRefreshSessions');
  }
}
