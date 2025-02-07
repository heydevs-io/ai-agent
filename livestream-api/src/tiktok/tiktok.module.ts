import { Module } from '@nestjs/common';
import { TikTokCommentController } from './tiktok.controller';
import { TikTokCommentService } from './tiktok.service';
import { BullModule } from '@nestjs/bullmq';
import { TIK_TOK_COMMENT_QUEUE } from './queue/constants';
import { TikTokCommentProcessor } from './queue/tiktok.processor';
import { WebSocketService } from './queue/websocket.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TIK_TOK_COMMENT_QUEUE,
    }),
  ],
  controllers: [TikTokCommentController],
  providers: [TikTokCommentService, TikTokCommentProcessor, WebSocketService],
})
export class TikTokCommentModule {}
