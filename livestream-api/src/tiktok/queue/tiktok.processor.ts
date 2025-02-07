import { plainToInstance } from 'class-transformer';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TIK_TOK_COMMENT_JOBS, TIK_TOK_COMMENT_QUEUE } from './constants';
import { SendCommentToLLMInputDto } from './dto';
import { WebSocketService } from './websocket.service';

@Processor(TIK_TOK_COMMENT_QUEUE, {
  concurrency: 1,
})
export class TikTokCommentProcessor extends WorkerHost {
  constructor(private readonly websocketService: WebSocketService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case TIK_TOK_COMMENT_JOBS.COMMENT_SEND_TO_LLM: {
        try {
          const data = plainToInstance(SendCommentToLLMInputDto, job.data);
          const { wsUrl, comment, username, createdAt } = data;
          const currentTime = Date.now();
          const timeDiff = currentTime - createdAt;
          console.log(this.websocketService.conversationEnd);
          //If the comment create time is longer than 2 min, skip it
          if (
            timeDiff >= 1000 * 60 * 60 * 60 ||
            !this.websocketService.conversationEnd
          ) {
            return;
          }
          this.websocketService.sendMessageToSocket(username, comment, wsUrl);
        } catch (error) {
          console.error(error);
        }
        break;
      }
    }
  }
}
