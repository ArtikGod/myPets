import { Request, Response } from 'express';
import { UrlService } from './url.service.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, RESPONSE_KEYS, HTTP_STATUS } from './url.constants.js';

export class UrlController {
  private urlService = new UrlService();

    async getAllUrls(req: Request, res: Response) {
    try {
        const urls = await this.urlService.getAllUrls();
        res.status(HTTP_STATUS.OK).json(urls);
    } catch (error: any) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        [RESPONSE_KEYS.MESSAGE]: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
    }


  async shortenUrl(req: Request, res: Response) {
    try {
      const { originalUrl, alias, expiresAt } = req.body;

      if (!originalUrl) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          [RESPONSE_KEYS.SUCCESS]: false,
          [RESPONSE_KEYS.MESSAGE]: ERROR_MESSAGES.ORIGINAL_URL_REQUIRED,
        });
      }

      const shortUrl = await this.urlService.shortenUrl(
        originalUrl,
        alias,
        expiresAt ? new Date(expiresAt) : undefined
      );

      res.status(HTTP_STATUS.OK).json({
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.MESSAGE]: SUCCESS_MESSAGES.SHORTENED,
        [RESPONSE_KEYS.DATA]: { shortUrl },
      });
    } catch (error: any) {
      console.error('Shorten Error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        [RESPONSE_KEYS.SUCCESS]: false,
        [RESPONSE_KEYS.MESSAGE]: error.message || ERROR_MESSAGES.SHORTEN_FAILED,
      });
    }
  }

  async redirectToOriginalUrl(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
      const originalUrl = await this.urlService.getOriginalUrl(shortUrl, ipAddress);
      res.redirect(originalUrl);
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        [RESPONSE_KEYS.SUCCESS]: false,
        [RESPONSE_KEYS.MESSAGE]: error.message || ERROR_MESSAGES.URL_NOT_FOUND,
      });
    }
  }

  async getUrlInfo(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const urlInfo = await this.urlService.getUrlInfo(shortUrl);
      res.status(HTTP_STATUS.OK).json({
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.DATA]: urlInfo,
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        [RESPONSE_KEYS.SUCCESS]: false,
        [RESPONSE_KEYS.MESSAGE]: error.message || ERROR_MESSAGES.URL_NOT_FOUND,
      });
    }
  }

  async deleteUrl(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      await this.urlService.deleteUrl(shortUrl);
      res.status(HTTP_STATUS.OK).json({
        [RESPONSE_KEYS.SUCCESS]: true,
        [RESPONSE_KEYS.MESSAGE]: SUCCESS_MESSAGES.DELETED,
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        [RESPONSE_KEYS.SUCCESS]: false,
        [RESPONSE_KEYS.MESSAGE]: error.message || ERROR_MESSAGES.URL_NOT_FOUND,
      });
    }
  }
}
