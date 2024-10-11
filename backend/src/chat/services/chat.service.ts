import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwilioService } from "nestjs-twilio";
import { AppLogger } from "src/shared/logger/logger.service";
import { CreateUserInput } from "src/user/dtos/user-create-input.dto";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/services/user.service";

import { OpenAIRoles } from "../constant/openai.constant";
import { TwilioMediaContentType } from "../constant/twilio.constant";
import { IncomingMessageDto, WalletInputDto } from "../dtos/chat-input.dto";
import { Session } from "../types/chat.type";
import { MessageType, ResponseMessage } from "../types/twilio.type";
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
    private readonly userService: UserService,
  ) {
    this.logger.setContext(ChatService.name);
    this.fromNumber = this.configService.get<string>('twilio.fromNumber') ?? '';
  }

  async processIncomingMessage(input: IncomingMessageDto) {    
    const { phone, threadId } = await this.getCacheSession(input);

    const result = await this.openAIService.processMessage(
      threadId,
      input.Body,
    );

    if (input.Body !== result) this.sendMessage(phone, result);
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

  decodeNumber(number: string): string {
    return number.replace('whatsapp:', '');
  }

  async getCacheSession(message: IncomingMessageDto): Promise<Session> {

    const { 
      ProfileName: name,
      From: phone
    } = message;

    let session = await this.cacheManager.get<Session>(phone);
    let threadId = session?.threadId ?? '';
    if (!session) {
      const thread = await this.openAIService.createThread(); 
      threadId = thread.id;
    }

    const user = await this.findOrCreateByPhone({ name, phone: this.decodeNumber(phone) });

    this.openAIService.addMessageToThread(threadId, `this is the information about the current user ${JSON.stringify(user)}`, OpenAIRoles.ASSISTANT);
    
    session = { phone, threadId, user };
    await this.cacheManager.set(phone, session, SESSION_TTL);

    return session;
  }

  async findOrCreateByPhone(input: CreateUserInput): Promise<User> {    
    return this.userService.findOrCreateByPhone(input);
  }

  async createUserWallets(phone: string, wallets: WalletInputDto[]): Promise<void> {
    const user = await this.userService.createUserWallets(phone, wallets);
    this.processIncomingMessage({
      Body: `User ${user.name} has created wallets`,
      ProfileName: user.name,
      From: user.phone,
      To: this.fromNumber,
      MessageType: MessageType.TEXT
    });
    
  }
}
