import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { UserModule } from 'src/user/user.module';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { OpenAIService } from './services/open-ai.service';

@Module({
  imports: [
    SharedModule,
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        accountSid: config.get('twilio.accountSid'),
        authToken: config.get('twilio.authToken'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(),
    UserModule,
  ],
  providers: [    
    JwtAuthStrategy,
    ChatService,
    OpenAIService,
  ],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
