import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwilioService } from "nestjs-twilio";
import { AppLogger } from "src/shared/logger/logger.service";

import { IncomingMessage, ResponseMessage } from "../types/twilio.type";


@Injectable()
export class ChatService {
  private readonly fromNumber: string = '';
  constructor(
    private readonly logger: AppLogger,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(ChatService.name);
    this.fromNumber = this.configService.get<string>('twilio.fromNumber') ?? '';
  }

  async processIncomingMessage(input: IncomingMessage) {    
    this.sendMessage(input.From, 'Hello from the other side');
  }

  async sendMessage(to: string, message: string): Promise<ResponseMessage> {
    const messageInstance = await this.twilioService.client.messages.create({
      body: message,
      from: this.transformNumber(this.fromNumber),
      to: this.transformNumber(to),
    });

    const responseMessage: ResponseMessage = {
      body: messageInstance.body,
      from: messageInstance.from,
      to: messageInstance.to,
    };

    return responseMessage;
  }

  transformNumber(number: string): string {
    return number.includes('whatsapp')
      ? number
      : `whatsapp:${number}`;
  }
}
