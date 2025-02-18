import { Injectable, Scope } from '@nestjs/common';
import * as WebSocket from 'ws';
import { WS_URL } from '@environments';

@Injectable()
export class WebSocketService {
  private ws: WebSocket;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS: number = 5;
  private readonly RECONNECT_INTERVAL: number = 3000; // 3 seconds
  conversationEnd = true;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.ws = new WebSocket(WS_URL);
    this.conversationEnd = true;

    this.ws.on('open', () => {
      this.conversationEnd = true;
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0; // Reset attempts on successful connection
    });

    this.ws.on('message', (data) => {
      try {
        const jsonData = JSON.parse(data.toString());
        if (
          jsonData.type == 'control' &&
          jsonData.text == 'conversation-chain-end'
        ) {
          setTimeout(() => {
            this.conversationEnd = true;
          }, Math.floor(Math.random() * (5000 - 3000 + 1) + 3000));
          // this.conversationEnd = true;
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        console.log('Raw message:', data);
      }
    });

    this.ws.on('close', () => {
      this.conversationEnd = true;
      console.log('🔌 WebSocket closed');
      this.attemptReconnect();
    });

    this.ws.on('error', (err) => {
      this.conversationEnd = true;
      console.error('❌ WebSocket error:', err);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`,
      );

      setTimeout(() => {
        this.initializeWebSocket();
      }, this.RECONNECT_INTERVAL);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  isSocketOpen(): boolean {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  sendMessageToSocket(username: string, comment: string, wsUrl: string) {
    this.conversationEnd = false;
    // Check if socket exists and is already open
    if (!this.isSocketOpen()) {
      this.ws = new WebSocket(wsUrl);
    } else {
      this.ws.send(
        JSON.stringify({
          type: 'text-input',
          text: username + ': ' + comment.trim(),
        }),
        (err) => {
          if (err) {
            console.error('❌ Failed to send message:', err);
          } else {
            console.log('📩 Message sent:', comment);
          }
        },
      );
    }
  }
}
