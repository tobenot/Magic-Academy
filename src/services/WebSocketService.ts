import { EventEmitter } from "./EventEmitter";

// 添加新的消息类型定义
interface UserOnlineEvent {
  type: "user_online";
  data: {
    id: number;
    username: string;
    timestamp: number;
  };
  online_count: number;
}

interface UserOfflineEvent {
  type: "user_offline";
  data: {
    id: number;
    username: string;
    timestamp: number;
  };
  online_count: number;
}

interface UserListUpdateEvent {
  type: "user_list_update";
  data: {
    users: Array<{
      id: number;
      username: string;
    }>;
    timestamp: number;
  };
  online_count: number;
}

interface ChatMessage {
  type: "chat";
  content: string;
  username: string;
  timestamp: number;
}

interface HistoryMessage {
  type: "history";
  messages: ChatMessage[];
}

type WebSocketMessage =
  | UserOnlineEvent
  | UserOfflineEvent
  | ChatMessage
  | HistoryMessage;

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly baseUrl: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private static instance: WebSocketService | null = null;
  private isConnecting = false; // 添加连接状态标记
  private heartbeatInterval: number | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000;

  private constructor() {
    super();
    this.baseUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");
  }

  // 单例模式获取实例
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
    // 防止重复连接
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

    // 清理旧的连接
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
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("[WebSocket] 收到消息:", message);

        // 根据消息类型分发事件
        switch (message.type) {
          case "user_online":
            this.emit("user_online", message);
            break;
          case "user_offline":
            this.emit("user_offline", message);
            break;
          case "chat":
            this.emit("message", message);
            break;
          case "history":
            this.emit("message", message);
            break;
          default:
            console.warn("[WebSocket] 未知消息类型:", message);
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      if (event.code === 4001) {
        console.error("认证失败");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        // 非认证失败的断开，尝试重连
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

      // 连接成功后主动获取在线用户列表
      this.emit("request_online_users");
    };
  }

  sendMessage(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: "chat",
        content,
        timestamp: Date.now(),
      };
      console.log("WebSocket 发送消息:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket 未连接，消息发送失败");
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.isConnecting = false;
      this.ws.onclose = null; // 移除重连逻辑
      this.ws.close();
      this.ws = null;
    }
  }

  // 添加移除所有监听器的方法
  public removeAllListeners(): void {
    this.events = {};
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "heartbeat",
            timestamp: Date.now(),
          }),
        );
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
