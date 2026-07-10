import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";
import { Module } from "@nestjs/common";


@Module({
    
    controllers: [SseController],
    providers: [SseService],
    exports: [SseService]
})

export class SseModule{
    
}
