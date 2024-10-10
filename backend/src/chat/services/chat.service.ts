import { Injectable } from "@nestjs/common";
import { AppLogger } from "src/shared/logger/logger.service";

import { IncomingMessage } from "../types/twilio.type";


@Injectable()
export class ChatService {
  constructor(   
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ChatService.name);
  }

  async processIncomingMessage(input: IncomingMessage) {
    console.log(input);
  }
}
