import { AppDataSource } from '../config/db.js';
import { Analytics } from '../entity/analytics.entity.js';
import { Url } from '../entity/url.entity.js';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES, HTTP_STATUS } from './analytics.constants.js';

export class AnalyticsService {
  private analyticsRepository: Repository<Analytics>;
  private urlRepository: Repository<Url>;

  constructor() {
    this.analyticsRepository = AppDataSource.getRepository(Analytics);
    this.urlRepository = AppDataSource.getRepository(Url);
  }

  async logClick(url: Url, ipAddress: string): Promise<void> {
    const record = this.analyticsRepository.create({ ipAddress, url });
    await this.analyticsRepository.save(record);

    url.clickCount += 1;
    await this.urlRepository.save(url);
  }

  async getAnalytics(shortUrl: string): Promise<{
    clickCount: number;
    last5IPs: string[];
  }> {
    const url = await this.urlRepository.findOne({
      where: { shortUrl },
      relations: ['analytics'],
      order: {
        analytics: {
          accessedAt: 'DESC',
        },
      },
    });

    if (!url) {
      throw {
        status: HTTP_STATUS.NOT_FOUND,
        message: ERROR_MESSAGES.URL_NOT_FOUND,
      };
    }

    return {
      clickCount: url.clickCount,
      last5IPs: url.analytics.slice(0, 5).map((a) => a.ipAddress),
    };
  }
}
