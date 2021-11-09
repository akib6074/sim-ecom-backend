import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  EcomCatelogCacheKeyEnum,
  EcomCoreCacheKeyEnum,
} from './ecom-cache-key.enum';

@Injectable()
export default class EcomCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async clearCache(
    toDeleteKey: EcomCatelogCacheKeyEnum | EcomCoreCacheKeyEnum,
  ) {
    const keys: string[] = await this.cacheManager.store.keys();
    for (const key of keys) {
      if (key.startsWith(toDeleteKey)) {
        await this.cacheManager.del(key);
      }
    }
  }

  async rebaseCache<T>(
    toRebaseKey: EcomCatelogCacheKeyEnum | EcomCoreCacheKeyEnum,
    data: T,
  ) {
    const keys: string[] = await this.cacheManager.store.keys();
    for (const key of keys) {
      if (key.startsWith(toRebaseKey)) {
        await this.cacheManager.set(key, data);
      }
    }
  }

  async clearAllCache() {
    await this.cacheManager.reset();
  }
}
