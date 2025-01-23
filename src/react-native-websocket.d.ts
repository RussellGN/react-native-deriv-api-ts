declare module "react-native-websocket" {
   import { Component } from "react";

   interface WebSocketProps {
      url: string;
      onOpen?: (event: WebSocketEvent) => void;
      onClose?: (event: WebSocketEvent) => void;
      onMessage?: (event: WebSocketMessageEvent) => void;
      onError?: (event: WebSocketErrorEvent) => void;
      reconnect?: boolean;
      reconnectInterval?: number;
      reconnectAttempts?: number;
      headers?: { [key: string]: string };
   }

   interface WebSocketEvent {
      type: string;
      target: WebSocket;
   }

   interface WebSocketMessageEvent extends WebSocketEvent {
      data: string;
   }

   interface WebSocketErrorEvent extends WebSocketEvent {
      message: string;
   }

   export default class WebSocket extends Component<WebSocketProps> {
      send(data: string): void;
      close(): void;
   }
}
