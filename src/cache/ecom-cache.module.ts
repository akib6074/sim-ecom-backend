import { CacheModule, Global, Module } from '@nestjs/common';
import EcomCacheService from './ecom-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      //1 day cache
      ttl: 24 * 60 * 60,
      // 1 lac of cache
      max: 100000,
    }),
  ],
  controllers: [],
  exports: [CacheModule, EcomCacheService],
  providers: [EcomCacheService],
})
export class EcomCacheModule {}
