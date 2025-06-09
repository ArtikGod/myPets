import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Cache } from 'cache-manager';
export declare class CacheInterceptor implements NestInterceptor {
    private cacheManager;
    private readonly CACHE_TTL;
    constructor(cacheManager: Cache);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private generateCacheKey;
}
