import { EventEmitter } from "./EventEmitter";
import {
  WSMessageType,
  WSServerMessage,
  WSChatMessage,
  WSSystemMessage,
  WSErrorMessage,
  WSHistoryMessage,
  WSUserStatusMessage,
  WSUserListMessage,
} from "../types/websocket";

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly baseUrl: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private static instance: WebSocketService | null = null;
  private isConnecting = false;
  private heartbeatInterval: number | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000;
  private messageSequence = 0;

  private constructor() {
    super();
    this.baseUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public static destroyInstance(): void {
    if (WebSocketService.instance) {
      WebSocketService.instance.removeAllListeners();
      WebSocketService.instance.disconnect();
      WebSocketService.instance = null;
    }
  }

  connect() {
    if (
      this.isConnecting ||
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.isConnecting = true;

    const token = localStorage.getItem("token");
    if (!token) {
      this.isConnecting = false;
      throw new Error("未登录");
    }

    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }

    const url = `${this.baseUrl}/ws?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      if (event.code === 4001) {
        console.error("认证失败");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
      }
      this.emit("disconnect");
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit("connected");

      this.emit("request_online_users");
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WSServerMessage;
      console.log("[WebSocket] 收到消息:", message);

      switch (message.type) {
        case WSMessageType.USER_ONLINE:
        case WSMessageType.USER_OFFLINE:
          this.emit("user_status", message as WSUserStatusMessage);
          break;
        case WSMessageType.USER_LIST_UPDATE:
          this.emit("user_list", message as WSUserListMessage);
          break;
        case WSMessageType.CHAT:
          this.emit("message", message as WSChatMessage);
          break;
        case WSMessageType.HISTORY:
          this.emit("message", message as WSHistoryMessage);
          break;
        case WSMessageType.ERROR:
          this.handleError(message as WSErrorMessage);
          break;
        case WSMessageType.CONNECT:
        case WSMessageType.DISCONNECT:
          this.handleSystemMessage(message as WSSystemMessage);
          break;
        default:
          console.warn("[WebSocket] 未知消息类型:", message);
      }
    } catch (e) {
      console.error("消息解析失败:", e);
    }
  }

  private handleError(error: WSErrorMessage): void {
    console.error(
      `[WebSocket] 错误: ${error.code} - ${error.message}`,
      error.details,
    );
    this.emit("error", error);
  }

  private handleSystemMessage(message: WSSystemMessage): void {
    if (
      message.type === WSMessageType.DISCONNECT &&
      message.data?.reconnectDelay
    ) {
      setTimeout(() => this.connect(), message.data.reconnectDelay);
    }
    this.emit(message.type, message);
  }

  public sendMessage(content: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WSChatMessage = {
        type: WSMessageType.CHAT,
        content,
        timestamp: Date.now(),
        sequence: ++this.messageSequence,
        username: localStorage.getItem("username") || "unknown",
      };
      console.log("[WebSocket] 发送消息:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] 未连接，消息发送失败");
    }
  }

  private sendHeartbeat(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const heartbeat: WSSystemMessage = {
        type: WSMessageType.HEARTBEAT,
        timestamp: Date.now(),
        sequence: ++this.messageSequence,
      };
      this.ws.send(JSON.stringify(heartbeat));
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.isConnecting = false;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  public removeAllListeners(): void {
    this.events = {};
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
