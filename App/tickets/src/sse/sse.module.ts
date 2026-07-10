// src/sse/sse.module.ts
import { Module } from '@nestjs/common';
import { SseController } from './see.controller';
import { SseService } from './sse.service';

@Module({
    controllers: [SseController],
    providers: [SseService],
    exports: [SseService],
})
export class SseModule {}