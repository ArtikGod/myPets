import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { MILLISECONDS_IN_SECOND } from '../shared/constants';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistRepo: Repository<BlacklistedToken>,
  ) {}

  async blacklist(token: string, expiresInSeconds: number) {
    const expiresAt = new Date(Date.now() + expiresInSeconds * MILLISECONDS_IN_SECOND);
    const blacklisted = this.blacklistRepo.create({ token, expiresAt });
    return this.blacklistRepo.save(blacklisted);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const record = await this.blacklistRepo.findOne({ where: { token } });
    return !!record;
  }
}
