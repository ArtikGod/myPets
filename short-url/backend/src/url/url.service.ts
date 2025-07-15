import { AppDataSource } from '../config/db.js';
import { Url } from '../entity/url.entity.js';
import { Analytics } from '../entity/analytics.entity.js';
import { nanoid } from 'nanoid';
import { ERROR_MESSAGES, HTTP_STATUS } from './url.constants.js';
import { throwError } from './utils.js';

export class UrlService {
  private urlRepository = AppDataSource.getRepository(Url);
  private analyticsRepository = AppDataSource.getRepository(Analytics);

  async getAllUrls() {
    return this.urlRepository.find();
  }

  async shortenUrl(originalUrl: string, alias?: string, expiresAt?: Date) {
    if (alias) {
      const existingUrl = await this.urlRepository.findOneBy({ alias });
      if (existingUrl) {
        throwError(ERROR_MESSAGES.ALIAS_IN_USE, HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (expiresAt && expiresAt <= new Date()) {
      throwError(ERROR_MESSAGES.INVALID_EXPIRATION_DATE, HTTP_STATUS.BAD_REQUEST);
    }

    const shortUrl = alias || nanoid(8);

    const url = this.urlRepository.create({
      originalUrl,
      shortUrl,
      alias: alias || null,
      expiresAt: expiresAt || null,
    });

    await this.urlRepository.save(url);
    return shortUrl;
  }

  async getOriginalUrl(shortUrl: string, ipAddress: string) {
    const url = await this.urlRepository.findOneBy({ shortUrl });

    if (!url) {
      throwError(ERROR_MESSAGES.URL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      throwError(ERROR_MESSAGES.URL_EXPIRED, HTTP_STATUS.BAD_REQUEST);
    }

    url.clickCount += 1;
    await this.urlRepository.save(url);

    const analytics = this.analyticsRepository.create({ ipAddress, url });
    await this.analyticsRepository.save(analytics);

    return url.originalUrl;
  }

  async getUrlInfo(shortUrl: string) {
    const url = await this.urlRepository.findOneBy({ shortUrl });
    if (!url) {
      throwError(ERROR_MESSAGES.URL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return url;
  }

  async deleteUrl(shortUrl: string) {
    const url = await this.urlRepository.findOneBy({ shortUrl });
    if (!url) {
      throwError(ERROR_MESSAGES.URL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    await this.urlRepository.remove(url);
  }
}
