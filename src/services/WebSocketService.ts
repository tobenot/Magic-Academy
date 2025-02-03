import { EventEmitter } from "./EventEmitter";
import {
  WSServerMessage,
  WSMessageType,
  WSClientMessage,
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

      this.emit("message", message);

      switch (message.type) {
        case WSMessageType.USER_ONLINE:
        case WSMessageType.USER_OFFLINE:
        case WSMessageType.USER_LIST_UPDATE:
        case WSMessageType.CONNECT:
        case WSMessageType.DISCONNECT:
          this.emit(message.type, message);
          break;
        case WSMessageType.ERROR:
          this.handleError(message);
          break;
        case WSMessageType.INTERACTION:
          this.emit("interaction_update", message);
          break;
        case WSMessageType.HEARTBEAT:
          break;
        default:
          console.warn("[WebSocket] 未知消息类型:", message);
      }
    } catch (e) {
      console.error("消息解析失败:", e);
    }
  }

  private handleError(error: WSServerMessage): void {
    console.error(
      `[WebSocket] 错误: ${error.data.code} - ${error.data.message}`,
      error.data.details,
    );
    this.emit("error", error);
  }

  public sendMessage(content: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WSClientMessage = {
        type: WSMessageType.CHAT,
        timestamp: Date.now(),
        data: {
          content,
        },
      };
      console.log("[WebSocket] 发送消息:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WebSocket] 未连接，消息发送失败");
    }
  }

  public async sendInteraction(
    actionId: string,
    targetId?: number,
  ): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const message: WSClientMessage = {
          type: WSMessageType.INTERACTION,
          timestamp: Date.now(),
          data: {
            actionId,
            targetId,
          },
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/interaction/perform`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message.data),
          },
        );

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error("[WebSocket] 发送交互失败:", err);
        throw err;
      }
    } else {
      console.warn("[WebSocket] 未连接，交互发送失败");
      throw new Error("WebSocket 未连接");
    }
  }

  public async cancelInteraction(
    actionId: string,
    targetId?: number,
  ): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/interaction/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ actionId, targetId }),
          },
        );

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error("[WebSocket] 取消交互失败:", err);
        throw err;
      }
    } else {
      console.warn("[WebSocket] 未连接，取消操作发送失败");
      throw new Error("WebSocket 未连接");
    }
  }

  private sendHeartbeat(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const heartbeat: WSClientMessage = {
        type: WSMessageType.HEARTBEAT,
        timestamp: Date.now(),
        data: {},
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

export default WebSocketService;
