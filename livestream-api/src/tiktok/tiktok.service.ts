import { Injectable } from '@nestjs/common';

@Injectable()
export class TikTokCommentService {
  getHello(): string {
    return 'Hello World!';
  }
}
