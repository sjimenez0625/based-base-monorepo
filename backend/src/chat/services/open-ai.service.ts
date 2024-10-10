import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AppLogger } from '../../shared/logger/logger.service';
import { OpenAIThead, OpenAIToolOutput } from '../types/openai.type';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { OpenAIFunctions } from '../constant/openai.constant';


@Injectable()
export class OpenAIService {
  private readonly openIaClient;
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.openIaClient = new OpenAI(this.configService.get('openai.apiKey'));
  }

  async createThread(): Promise<OpenAIThead> {
    const thread = await this.openIaClient.beta.threads.create() as OpenAIThead;

    return thread;
  }

  async processMessage(
    threadId: string,
    message: string,
    instructions?: string,
  ): Promise<any> {
    await this.addMessageToThread(threadId, message);
    await this.createAndPoll(threadId, instructions);
    const response = await this.getMessagesFromThread(threadId);

    return response;
  }

  async addMessageToThread(threadId: string, message: string): Promise<void> {
    await this.openIaClient.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  }

  async createAndPoll(threadId: string, instructions?: string): Promise<any> {
    const run = await this.openIaClient.beta.threads.runs.createAndPoll(
      threadId,
      {
        assistant_id: this.configService.get('openai.assistantId') ?? '',
        instructions,
      },
    );

    await this.runRequiredActions(run);

    return run;
  }

  async runRequiredActions(run: Run): Promise<any> {
    const toolOutputs: OpenAIToolOutput[] = [];
    if (run.required_action) {
      for (const tool of run.required_action.submit_tool_outputs.tool_calls) {
        switch (tool.function.name) {
          case OpenAIFunctions.GET_WEATHER:
            toolOutputs.push({
              tool_call_id: tool.id,
              output: 'Weather is sunny',
            });
            break;
          default:
            break;
        }
      }
    }

    if (toolOutputs.length) {
      await this.openIaClient.beta.threads.runs.submitToolOutputs(
        run.thread_id,
        run.id,
        {
          tool_outputs: toolOutputs,
        }
      );
      
    }
  }

  async getMessagesFromThread(threadId: string): Promise<any> {
    const messages =
      await this.openIaClient.beta.threads.messages.list(threadId);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const response = messages.data[0].content[0].text.value;

    return response;
  }
}
