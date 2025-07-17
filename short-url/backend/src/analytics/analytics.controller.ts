import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AnalyticsService } from './analytics.service.js';
import { UrlService } from '../url/url.service.js';
import { ERROR_MESSAGES, RESPONSE_KEYS } from './analytics.constants.js'; 

export class AnalyticsController {
  private analyticsService: AnalyticsService;
  private urlService: UrlService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.urlService = new UrlService();
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const analytics = await this.analyticsService.getAnalytics(shortUrl);
      res.status(httpStatus.OK).json(analytics);
    } catch (error: any) {
      const status = error.status || httpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        [RESPONSE_KEYS.ERROR]: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async logClick(req: Request, res: Response) {
    try {
      const { shortUrl } = req.params;
      const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';

      const url = await this.urlService.getUrlInfo(shortUrl);
      await this.analyticsService.logClick(url, ipAddress);

      res.status(httpStatus.NO_CONTENT).end();
    } catch (error: any) {
      const status = error.status || httpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        [RESPONSE_KEYS.ERROR]: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
