import { IsNumber, IsString } from 'class-validator';

export class SendCommentToLLMInputDto {
  @IsString()
  wsUrl: string;

  @IsString()
  comment: string;

  @IsString()
  username: string;

  @IsNumber()
  createdAt: number;
}
