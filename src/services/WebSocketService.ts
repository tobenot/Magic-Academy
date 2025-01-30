import { EventEmitter } from "./EventEmitter";

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly baseUrl: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private static instance: WebSocketService | null = null;
  private isConnecting = false; // 添加连接状态标记

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
        const message = JSON.parse(event.data);
        console.log("[WebSocket] 准备发送消息事件:", message);
        this.emit("message", message);
        console.log("[WebSocket] 消息事件发送完成");
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
      this.reconnectAttempts = 0; // 连接成功后重置重连次数
      this.emit("connected");
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
}
