import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useCallback,
} from "react";
import { WebSocketService } from "../services/WebSocketService";
import { AuthService } from "../services/AuthService";

interface Message {
  username: string;
  content: string;
  timestamp: number;
  type: "chat" | "system" | "history";
  messages?: Message[];
}

const ChatRoom = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const authService = new AuthService();

  // 使用 useCallback 包装消息处理函数
  const handleMessage = useCallback((message: Message) => {
    if (message.type === "history") {
      setMessages(message.messages || []);
    } else {
      setMessages((prev) => [...prev, message]);
    }
  }, []);

  const handleConnected = useCallback(() => {
    console.log("WebSocket 已连接");
    setConnected(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("WebSocket 已断开");
    setConnected(false);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error("WebSocket 错误:", error);
  }, []);

  // 处理消息发送
  const sendMessage = useCallback((): void => {
    if (!inputMessage.trim()) return;
    wsService?.sendMessage(inputMessage.trim());
    setInputMessage("");
  }, [inputMessage, wsService]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setInputMessage(e.target.value);
    },
    [],
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        sendMessage();
      }
    },
    [sendMessage],
  );

  // WebSocket 连接和事件处理
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUsername(user.username);
          const ws = WebSocketService.getInstance(user.username);
          setWsService(ws);

          ws.off("message", handleMessage);
          ws.on("message", handleMessage);
          ws.on("connected", handleConnected);
          ws.on("disconnect", handleDisconnect);
          ws.on("error", handleError);

          ws.connect();

          return () => {
            ws.off("message", handleMessage);
            ws.off("connected", handleConnected);
            ws.off("disconnect", handleDisconnect);
            ws.off("error", handleError);
          };
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [handleMessage, handleConnected, handleDisconnect, handleError]);

  // 更新页面标题
  useEffect(() => {
    document.title = `魔法学院 - ${username || "未登录"}`;
    return () => {
      document.title = "魔法学院";
    };
  }, [username]);

  return (
    <div className="chat-container flex flex-col h-screen p-5 bg-black/80">
      {!connected && (
        <div className="text-yellow-500 text-center mb-2">
          正在连接聊天服务器...
        </div>
      )}

      {username && (
        <div className="text-white text-sm mb-2">当前用户：{username}</div>
      )}

      <div className="chat-messages flex-1 overflow-y-auto mb-5 p-3 bg-white/10 rounded-lg">
        {messages.map((msg: Message, index: number) => (
          <div
            key={index}
            className={`message m-2 p-2 rounded ${
              msg.type === "system"
                ? "bg-gray-700/50 text-gray-300"
                : "bg-white/5"
            }`}
          >
            <span className="username text-primary font-bold mr-2">
              {msg.username}
            </span>
            <span className="content text-white">{msg.content}</span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="chat-input flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={connected ? "输入消息..." : "正在连接..."}
          disabled={!connected}
          className="flex-1 p-2 rounded bg-white/10 text-white border border-white/20 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          className="px-4 py-2 bg-primary hover:bg-secondary text-black rounded transition disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
