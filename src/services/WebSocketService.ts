import { EventEmitter } from "./EventEmitter";

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly baseUrl: string;
  private username: string;

  constructor(username: string) {
    super();
    this.baseUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws");
    this.username = username;
  }

  connect() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("未登录");
    }

    const url = `${this.baseUrl}/ws?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit("message", message);
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };

    this.ws.onclose = (event) => {
      if (event.code === 4001) {
        console.error("认证失败");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
      }
      this.emit("disconnect");
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };

    this.ws.onopen = () => {
      this.emit("connected");
    };
  }

  sendMessage(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "chat",
          content,
          timestamp: Date.now(),
        }),
      );
    }
  }

  disconnect() {
    this.ws?.close();
  }
}
