import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppLogger } from "src/shared/logger/logger.service";

import { ChatService } from "../services/chat.service";
import { IncomingMessage } from "../types/twilio.type";


@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(    
    private readonly logger: AppLogger,
    private readonly chatService: ChatService,
  ) {
    this.logger.setContext(ChatController.name);
  }

  @Post('twilio/webhook')
  async handleIncomingTwilioMessage(@Body() input: IncomingMessage) {
    this.chatService.processIncomingMessage(input);
  }
}
