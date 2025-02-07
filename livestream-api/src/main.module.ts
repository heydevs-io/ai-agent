import { Module } from '@nestjs/common';
import { TikTokCommentModule } from './tiktok/tiktok.module';
import { BullModule } from '@nestjs/bullmq';
import { BullConfigService } from './configs/bull.config';

@Module({
  imports: [
    TikTokCommentModule,
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
})
export class AppModule {}
