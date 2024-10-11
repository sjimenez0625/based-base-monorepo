import { Injectable } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { WalletInputDto } from 'src/chat/dtos/chat-input.dto';

import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { CreateUserInput } from '../dtos/user-create-input.dto';
import { UserOutput } from '../dtos/user-output.dto';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserService.name);
  }
  async createUser(
    ctx: RequestContext,
    input: CreateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    const user = plainToClass(User, input);

    this.logger.log(ctx, `calling ${UserRepository.name}.saveUser`);
    await this.repository.save(user);

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findOrCreateByPhone(input: CreateUserInput): Promise<User> {
    const user = await this.repository.findByPhone(input.phone);
    if (user) {
      return user;
    } else {
      return this.repository.save(input);
    }
  }

  async createUserWallets(phone: string, wallets: WalletInputDto[]): Promise<User> {
    const user = await this.repository.findByPhone(phone);
    if (!user) {
      throw new Error('User not found');
    }

    user.wallets = plainToInstance(Wallet, wallets);

    return this.repository.save(user);
  }
}
