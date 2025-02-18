import { Controller, Get, Param } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { TIK_TOK_COMMENT_JOBS, TIK_TOK_COMMENT_QUEUE } from './queue/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { WS_URL } from '@environments';
import { WebSocketService } from './queue/websocket.service';

@Controller({
  path: 'tiktok',
})
export class TikTokCommentController {
  private tiktokLiveConnection: WebcastPushConnection;

  constructor(
    @InjectQueue(TIK_TOK_COMMENT_QUEUE) private readonly queue: Queue,
    private readonly webSocketService: WebSocketService,
  ) {}

  @Get('test')
  test() {
    console.log('test');
    // this.webSocketService.sendMessageToSocket(
    //   'I want to be a good person',
    //   WS_URL,
    // );
    this.queue.add(TIK_TOK_COMMENT_JOBS.COMMENT_SEND_TO_LLM, {
      wsUrl: WS_URL,
      comment: 'I want to be a good person',
      username: 'test',
      createdAt: Date.now(),
    });
  }

  @Get(':username')
  getLiveComment(@Param('username') username: string) {
    if (this.tiktokLiveConnection) {
      this.tiktokLiveConnection.disconnect();
    }

    // Username of someone who is currently live
    const tiktokUsername = username;

    // Create a new wrapper object and pass the username
    this.tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    // Connect to the chat (await can be used as well)
    this.tiktokLiveConnection
      .connect()
      .then((state) => {
        console.info(`Connected to roomId ${state.roomId}`);
      })
      .catch((err) => {
        console.error('Failed to connect', err);
        this.webSocketService.conversationEnd = true;
        // this.getLiveComment(username);
      });

    // Define the events that you want to handle
    // In this case we listen to chat messages (comments)
    this.tiktokLiveConnection.on('chat', (data) => {
      console.log(`${data.nickname}: ${data.comment}`);
      this.queue.add(TIK_TOK_COMMENT_JOBS.COMMENT_SEND_TO_LLM, {
        wsUrl: WS_URL,
        comment: data.comment,
        username: data.nickname,
        createdAt: data.createTime,
      });
    });
  }

  @Get('stop')
  stop() {
    this.webSocketService.conversationEnd = true;
    if (this.tiktokLiveConnection) {
      this.tiktokLiveConnection.disconnect();
    }
  }
}
