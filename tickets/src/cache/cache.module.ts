import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const host = config.get('REDIS_HOST') || 'localhost';
        const port = config.get('REDIS_PORT') || '6379';
        const password = config.get('REDIS_PASSWORD');
        const auth = password ? `:${password}@` : '';
        const uri = `redis://${auth}${host}:${port}`;
        
        return {
          stores: [
            createKeyv(uri)
          ],
          ttl: 14400000, // 4 horas en milisegundos (4 * 60 * 60 * 1000)
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
