import * as dotenv from 'dotenv';

dotenv.config();

//Redis
export const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT: number = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT, 10)
  : 6379;

export const WS_URL: string = process.env.WS_URL || 'ws://localhost:8080';
