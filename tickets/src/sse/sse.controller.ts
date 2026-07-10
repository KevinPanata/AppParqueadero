import { Controller, MessageEvent, Sse } from "@nestjs/common";
import { SseService } from "./sse.service";
import { map, Observable } from "rxjs";

@Controller('sse')
export class SseController{
    constructor(private readonly sseService: SseService){}

    @Sse('espacios')
    streamEspacios():Observable<MessageEvent>{
        return this.sseService.getEventStream().pipe(
            map(event => ({
                data: JSON.stringify(event),
                type: event.type,
                
            })),
        );
    }






}