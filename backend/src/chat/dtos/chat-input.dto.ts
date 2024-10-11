import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MessageType } from '../types/twilio.type';
import { Type } from 'class-transformer';

export class IncomingMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ProfileName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  From: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  To: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  Body: string;

  @ApiProperty({ enum: MessageType })
  @IsNotEmpty()
  @IsEnum(MessageType)
  MessageType: MessageType;
}


export class WalletInputDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    address: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    chainId: string;
  }
  
  export class CreateUserWalletsInputDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;
  
    @ApiProperty({ type: [WalletInputDto] })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WalletInputDto)
    wallets: WalletInputDto[];
  }