import {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useCallback,
} from "react";
import { WebSocketService } from "../services/WebSocketService";
import { AuthService } from "../services/AuthService";
import {
  WSMessageType,
  WSUserStatusMessage,
  WSUserListMessage,
  WSUser as OnlineUser,
  WSInteractionMessage,
  WSServerMessage,
} from "../types/websocket";
import UserProfileCard from "./UserProfile";
import classNames from "classnames";

interface Message {
  type: "chat" | "system" | "interaction";
  username: string;
  content: string;
  timestamp: number;
  actionId?: string;
  status?: "active" | "completed" | "instant";
  duration?: number;
  initiatorId?: number;
  targetId?: number;
  targetName?: string;
}

const ChatRoom = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const authService = new AuthService();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // 处理消息发送
  const sendMessage = useCallback((): void => {
    if (!inputMessage.trim()) return;
    wsService?.sendMessage(inputMessage.trim());
    setInputMessage("");
  }, [inputMessage, wsService]);

  // 修改消息处理函数，使用统一的 message.data.message 作为显示文本
  const handleMessage = useCallback((message: WSServerMessage) => {
    switch (message.data.type) {
      case "chat":
        setMessages((prev) => [
          ...prev,
          {
            type: "chat",
            username: message.data.initiatorName,
            content: message.data.message, // 使用统一的 message 字段
            timestamp: message.timestamp,
            initiatorId: message.data.initiatorId,
          },
        ]);
        break;

      case "interaction":
        setMessages((prev) => [
          ...prev,
          {
            type: "interaction",
            username: message.data.initiatorName,
            content: message.data.message,
            timestamp: message.timestamp,
            actionId: message.data.actionId,
            status: message.data.status,
            duration:
              message.data.duration && message.data.duration > 0
                ? message.data.duration
                : undefined,
            initiatorId: message.data.initiatorId,
            targetId: message.data.targetId,
            targetName: message.data.targetName,
          },
        ]);
        break;

      case "system":
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            username: "System",
            content: message.data.message, // 使用统一的 message 字段
            timestamp: message.timestamp,
          },
        ]);
        break;
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

  // 将 fetchOnlineUsers 的声明移到最前面
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const users = await authService.getOnlineUsers();
      setOnlineUsers(users);
    } catch (error) {
      console.error("获取在线用户列表失败:", error);
    }
  }, []);

  // 添加交互消息处理
  const handleInteractionMessage = useCallback(
    (message: WSInteractionMessage) => {
      const interactionMessage: Message = {
        type: "interaction",
        username: message.data.initiatorName,
        content: message.data.message,
        timestamp: message.timestamp,
        actionId: message.data.actionId,
        status: message.data.status,
        duration:
          message.data.duration && message.data.duration > 0
            ? message.data.duration
            : undefined,
        initiatorId: message.data.initiatorId,
        targetId: message.data.targetId,
        targetName: message.data.targetName,
      };
      setMessages((prev) => [...prev, interactionMessage]);
    },
    [],
  );

  // WebSocket 连接和事件处理
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && typeof user === "object" && "username" in user) {
          console.log("Current user:", user);

          if (typeof user.username !== "string") {
            console.error("Invalid username type:", typeof user.username);
            return;
          }

          setUsername(user.username);
          const ws = WebSocketService.getInstance();
          setWsService(ws);

          // 清理旧的事件监听
          ws.off("message", handleMessage);
          ws.off("connected", handleConnected);
          ws.off("disconnect", handleDisconnect);
          ws.off("error", handleError);

          // 添加新的事件监听
          ws.on("message", handleMessage);
          ws.on("connected", handleConnected);
          ws.on("disconnect", handleDisconnect);
          ws.on("error", handleError);

          // 添加用户状态事件监听
          ws.on("user_online", handleUserOnline);
          ws.on("user_offline", handleUserOffline);
          ws.on("user_list_update", handleUserListUpdate);

          // 添加请求在线用户列表的处理
          ws.on("request_online_users", () => {
            console.log("[WebSocket] 连接成功,获取在线用户列表");
            fetchOnlineUsers();
          });

          // 添加交互消息监听
          ws.on("interaction_update", handleInteractionMessage);

          ws.connect();

          return () => {
            ws.off("message", handleMessage);
            ws.off("connected", handleConnected);
            ws.off("disconnect", handleDisconnect);
            ws.off("error", handleError);
            ws.off("user_online", handleUserOnline);
            ws.off("user_offline", handleUserOffline);
            ws.off("user_list_update", handleUserListUpdate);
            ws.off("request_online_users", fetchOnlineUsers);
            ws.off("interaction_update", handleInteractionMessage);
          };
        } else {
          console.error("Invalid user data:", user);
          authService.logout();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
      }
    };

    checkAuth();
  }, [
    handleMessage,
    handleConnected,
    handleDisconnect,
    handleError,
    fetchOnlineUsers,
    handleInteractionMessage,
  ]);

  // 更新页面标题
  useEffect(() => {
    document.title = `魔法学院 - ${username || "未登录"}`;
    return () => {
      document.title = "魔法学院";
    };
  }, [username]);

  // 修改获取在线用户列表的函数
  useEffect(() => {
    fetchOnlineUsers();
    // 减少轮询间隔到 10 秒,因为这是实时在线用户
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => clearInterval(interval);
  }, [fetchOnlineUsers]);

  // 更新事件处理函数
  const handleUserOnline = useCallback((event: WSUserStatusMessage) => {
    if (event.type !== WSMessageType.USER_ONLINE) return;

    setOnlineUsers((prev) => {
      const exists = prev.some((user) => user.id === event.data.id);
      if (!exists) {
        return [
          ...prev,
          {
            id: event.data.id,
            username: event.data.username,
          },
        ];
      }
      return prev;
    });
  }, []);

  const handleUserOffline = useCallback((event: WSUserStatusMessage) => {
    if (event.type !== WSMessageType.USER_OFFLINE) return;

    setOnlineUsers((prev) => prev.filter((user) => user.id !== event.data.id));
  }, []);

  const handleUserListUpdate = useCallback((event: WSUserListMessage) => {
    if (event.type !== WSMessageType.USER_LIST_UPDATE) return;
    setOnlineUsers(event.data.users);
  }, []);

  // 修改消息渲染部分
  const renderMessage = (msg: Message) => {
    const messageClass = {
      chat: "bg-white/5",
      system: "bg-gray-700/50 text-gray-300",
      interaction: classNames("transition-all", {
        "bg-primary/10 border border-primary/20":
          msg.status === "active" && msg.duration,
        "bg-white/5": msg.status === "instant" || !msg.duration,
        "bg-white/5 opacity-75": msg.status === "completed",
      }),
    }[msg.type];

    return (
      <div className={`message m-2 p-2 rounded ${messageClass}`}>
        <span
          className="username text-primary font-bold mr-2 cursor-pointer hover:underline"
          onClick={() => msg.initiatorId && setSelectedUserId(msg.initiatorId)}
        >
          {msg.username}
        </span>

        {msg.type === "interaction" && msg.targetName ? (
          <span className="content text-white">
            <span className="text-gray-400 mr-1">对</span>
            <span
              className="text-primary cursor-pointer hover:underline mr-1"
              onClick={() => msg.targetId && setSelectedUserId(msg.targetId)}
            >
              {msg.targetName}
            </span>
            <span className="text-white">{msg.content}</span>
          </span>
        ) : (
          <span className="content text-white">{msg.content}</span>
        )}

        {msg.type === "interaction" &&
          msg.duration &&
          msg.status === "active" && (
            <div className="mt-2 h-1 bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-primary animate-progress"
                style={
                  { "--duration": `${msg.duration}ms` } as React.CSSProperties
                }
              />
            </div>
          )}

        <span className="text-xs text-gray-500 ml-2">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </span>
      </div>
    );
  };

  return (
    <div className="chat-container flex flex-col h-screen p-5 bg-black/80">
      {!connected && (
        <div className="text-yellow-500 text-center mb-2">
          正在连接聊天服务器...
        </div>
      )}

      <div className="flex gap-4 h-full">
        {/* 在线用户列表 - 移除 hidden md:block,让移动端也显示 */}
        <div className="w-48 bg-white/10 rounded-lg p-3">
          <h3 className="text-primary font-bold mb-3 text-sm">
            在线玩家 ({onlineUsers.length})
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="text-white text-sm p-2 rounded bg-white/5 hover:bg-white/10 transition cursor-pointer"
                onClick={() => setSelectedUserId(user.id)}
              >
                {user.username}
              </div>
            ))}
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 flex flex-col">
          {username && (
            <div className="text-white text-sm mb-2">当前用户：{username}</div>
          )}

          <div className="chat-messages flex-1 overflow-y-auto mb-5 p-3 bg-white/10 rounded-lg">
            {messages.map((msg: Message, index: number) => (
              <div key={index}>{renderMessage(msg)}</div>
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
      </div>

      {selectedUserId && (
        <UserProfileCard
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
