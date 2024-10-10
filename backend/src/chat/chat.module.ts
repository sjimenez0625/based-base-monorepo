import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';

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
    })
  ],
  providers: [    
    JwtAuthStrategy,
    ChatService,
  ],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
