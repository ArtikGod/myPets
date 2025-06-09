import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly CACHE_TTL = 60; 

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (request.method !== 'GET') {
      return next.handle();
    }

    const key = this.generateCacheKey(request);
    const cachedData = await this.cacheManager.get(key);

    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap((data) => {
        if (data) {
          this.cacheManager.set(key, data, this.CACHE_TTL * 1000);
        }
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    return `cache:${request.method}_${request.originalUrl}`;
  }
}