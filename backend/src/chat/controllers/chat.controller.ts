import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppLogger } from "src/shared/logger/logger.service";

import { CreateUserWalletsInputDto, IncomingMessageDto } from "../dtos/chat-input.dto";
import { ChatService } from "../services/chat.service";


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
  async handleIncomingTwilioMessage(@Body() input: IncomingMessageDto) {
    this.chatService.processIncomingMessage(input);
  }

  @Post('user/wallets')
  async createUserWallets(@Body() input: CreateUserWalletsInputDto) {
    const { phone, wallets } = input;

    return this.chatService.createUserWallets(phone, wallets);
  }
}
