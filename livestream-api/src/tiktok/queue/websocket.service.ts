import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { WS_URL } from '@environments';

@Injectable()
export class WebSocketService {
  private ws: WebSocket;
  conversationEnd: boolean = true;
  constructor() {
    this.ws = new WebSocket(WS_URL);
    this.ws.on('message', (data) => {
      try {
        const jsonData = JSON.parse(data.toString());
        if (
          jsonData.type == 'control' &&
          jsonData.text == 'conversation-chain-end'
        ) {
          this.conversationEnd = true;
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        console.log('Raw message:', data);
      }
    });

    this.ws.on('close', () => {
      this.conversationEnd = true;
      console.log('🔌 WebSocket closed');
    });

    this.ws.on('error', (err) => {
      this.conversationEnd = true;
      console.error('❌ WebSocket error:', err);
    });
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
