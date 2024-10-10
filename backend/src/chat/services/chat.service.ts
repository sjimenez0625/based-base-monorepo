import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwilioService } from "nestjs-twilio";
import { AppLogger } from "src/shared/logger/logger.service";

import { Session } from "../types/chat.type";
import { IncomingMessage, ResponseMessage } from "../types/twilio.type";
import { OpenAIService } from "./open-ai.service";

const SESSION_TTL = 60000 * 120;

@Injectable()
export class ChatService {
  private readonly fromNumber: string = '';
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: AppLogger,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly openAIService: OpenAIService,
  ) {
    this.logger.setContext(ChatService.name);
    this.fromNumber = this.configService.get<string>('twilio.fromNumber') ?? '';
  }

  async processIncomingMessage(input: IncomingMessage) {    
    const { number, threadId } = await this.getCacheSession(input.From);

    const result = await this.openAIService.processMessage(
      threadId,
      input.Body,
    );

    this.sendMessage(number, result);
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

  async getCacheSession(number: string): Promise<Session> {
    let session = await this.cacheManager.get<Session>(number);
    if (!session) {
      const { id } = await this.openAIService.createThread();
      session = { number, threadId: id };
      await this.cacheManager.set(number, session, SESSION_TTL);
    }

    return session;
  }
}
