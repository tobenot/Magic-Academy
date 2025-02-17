import {
  useState,
  useMemo,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useCallback,
} from "react";
import { WebSocketService } from "../services/WebSocketService";
import { AuthService } from "../services/AuthService";
import {
  WSMessageType,
  WSUser,
  WSServerMessage,
  WSMessageData,
  WSChatHistoryData,
} from "../types/websocket";
import UserProfileCard from "./UserProfile";
import classNames from "classnames";
import CGModal from "./CGModal";

interface Message {
  type: WSMessageData["type"];
  messageId: string;
  username: string;
  content: string;
  timestamp: number;
  actionId?: string;
  status?: WSMessageData["status"];
  duration?: number;
  startTime?: number;
  initialRemaining?: number;
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

  // 使用 useMemo 保持 AuthService 实例稳定
  const authService = useMemo(() => new AuthService(), []);

  const [onlineUsers, setOnlineUsers] = useState<WSUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  // 新增状态：控制生成 CG 弹窗可见性和图片 URL
  const [cgModalVisible, setCgModalVisible] = useState<boolean>(false);
  const [cgImageUrl, setCgImageUrl] = useState<string | null>(null);
  // 新增状态：跟踪正在生成CG图片的消息ID列表
  const [generatingCGMessages, setGeneratingCGMessages] = useState<string[]>([]);

  // 处理消息发送
  const sendMessage = useCallback((): void => {
    if (!inputMessage.trim()) return;
    wsService?.sendMessage(inputMessage.trim());
    setInputMessage("");
  }, [inputMessage, wsService]);

  // 修改消息处理函数
  const handleMessage = useCallback((message: WSServerMessage) => {
    switch (message.type) {
      case WSMessageType.CHAT:
        setMessages((prev) => [
          ...prev,
          {
            type: message.data.type,
            messageId: message.messageId,
            username: message.data.initiatorName || "未知用户",
            content: message.data.message,
            timestamp: message.timestamp,
            initiatorId: message.data.initiatorId,
          },
        ]);
        break;

      case WSMessageType.CHAT_HISTORY: {
        // 按照新的接口格式解析历史消息
        const historyData = message.data as WSChatHistoryData;
        if (Array.isArray(historyData.messages)) {
          const historyMessages = historyData.messages.map((msg: WSServerMessage) => ({
            type: msg.data.type,
            messageId: msg.messageId,
            username:
              msg.data.initiatorName ||
              (msg.data.type === "system" ? "System" : "未知用户"),
            content: msg.data.message, // 此处message为必填字段
            timestamp: msg.timestamp, // 使用外层的timestamp值
            initiatorId: msg.data.initiatorId,
            actionId: msg.data.actionId,
            status: msg.data.status,
            duration:
              msg.data.duration && msg.data.duration > 0
                ? msg.data.duration
                : undefined,
            targetId: msg.data.targetId,
            targetName: msg.data.targetName,
            startTime: msg.data.startTime,
            initialRemaining:
              msg.data.duration && msg.data.startTime
                ? Math.max(msg.data.duration - (Date.now() - msg.data.startTime), 0)
                : undefined,
          }));
          setMessages((prev) => [...historyMessages, ...prev]);
        }
        break;
      }

      case WSMessageType.INTERACTION:
        setMessages((prev) => [
          ...prev,
          {
            type: message.data.type,
            messageId: message.messageId,
            username: message.data.initiatorName || "未知用户",
            content: message.data.message,
            timestamp: message.timestamp,
            actionId: message.data.actionId,
            status: message.data.status,
            duration:
              message.data.duration && message.data.duration > 0
                ? message.data.duration
                : undefined,
            startTime: message.data.startTime,
            initialRemaining:
              message.data.duration && message.data.startTime
                ? Math.max(message.data.duration - (Date.now() - message.data.startTime), 0)
                : undefined,
            initiatorId: message.data.initiatorId,
            targetId: message.data.targetId,
            targetName: message.data.targetName,
          },
        ]);
        break;

      case WSMessageType.SYSTEM:
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            messageId: message.messageId,
            username: "System",
            content: message.data.message,
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

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setInputMessage(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }, [sendMessage]);

  // 修改后的生成交互CG图片函数
  const handleGenerateCG = useCallback(async (interactionMessageId: string) => {
    // 添加当前 messageId 到生成中的状态，防止重复点击
    setGeneratingCGMessages((prev) => {
      if (prev.includes(interactionMessageId)) return prev;
      return [...prev, interactionMessageId];
    });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/interaction/generate-cg`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ interactionMessageId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { imageUrl } = await response.json();
      // 更新状态，显示弹窗UI并传入获取到的图片 URL
      setCgImageUrl(imageUrl);
      setCgModalVisible(true);
    } catch (error: any) {
      console.error("生成CG图片失败:", error);
      alert("生成CG图片失败: " + error.message);
    } finally {
      // 移除生成中的状态
      setGeneratingCGMessages((prev) =>
        prev.filter((id) => id !== interactionMessageId)
      );
    }
  }, []);

  // 定义获取在线用户列表的函数
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const users = await authService.getOnlineUsers();
      // 注意：getOnlineUsers接口返回的对象目前只包含 id 和 nickname，
      // 为避免 TS 错误，这里为缺失的字段直接赋默认值，
      // 请与后端确认是否需要返回status和lastActive字段。
      const transformed: WSUser[] = (users as Array<{ id: number; nickname: string }>).map(
        (user) => ({
          id: user.id,
          nickname: user.nickname,
          status: "online", // 默认赋值
          lastActive: Date.now(), // 默认赋值
        })
      );
      setOnlineUsers(transformed);
    } catch (error) {
      console.error("获取在线用户列表失败:", error);
    }
  }, [authService]);

  // 用户上线处理函数
  const handleUserOnline = useCallback((event: WSServerMessage) => {
    if (event.type !== WSMessageType.USER_ONLINE) return;

    setOnlineUsers((prev) => {
      const exists = prev.some((user) => user.id === event.data.initiatorId);
      if (!exists && event.data.initiatorId && event.data.initiatorName) {
        return [
          ...prev,
          {
            id: event.data.initiatorId,
            nickname: event.data.initiatorName,
            status: "online",
            lastActive: event.timestamp,
          },
        ];
      }
      return prev;
    });
  }, []);

  // 用户下线处理函数
  const handleUserOffline = useCallback((event: WSServerMessage) => {
    if (event.type !== WSMessageType.USER_OFFLINE) return;
    setOnlineUsers((prev) =>
      prev.filter((user) => user.id !== event.data.initiatorId)
    );
  }, []);

  // 用户列表更新处理函数，转换用户数据
  const handleUserListUpdate = useCallback((event: WSServerMessage) => {
    if (event.type !== WSMessageType.USER_LIST_UPDATE || !event.data.users) return;
    const updatedUsers: WSUser[] = event.data.users.map((user) => ({
      ...user,
      status: user.status || "online",
      lastActive: user.lastActive || event.timestamp,
    }));
    setOnlineUsers(updatedUsers);
  }, []);

  // WebSocket 连接和事件处理
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && typeof user === "object" && "nickname" in user) {
          console.log("Current user:", user);

          if (typeof user.nickname !== "string") {
            console.error("Invalid nickname type:", typeof user.nickname);
            return;
          }

          setUsername(user.nickname);
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
          ws.on(WSMessageType.USER_ONLINE, handleUserOnline);
          ws.on(WSMessageType.USER_OFFLINE, handleUserOffline);
          ws.on(WSMessageType.USER_LIST_UPDATE, handleUserListUpdate);

          // 添加请求在线用户列表的处理
          ws.on("request_online_users", () => {
            console.log("[WebSocket] 连接成功,获取在线用户列表");
            fetchOnlineUsers();
          });

          ws.connect();

          return () => {
            ws.off("message", handleMessage);
            ws.off("connected", handleConnected);
            ws.off("disconnect", handleDisconnect);
            ws.off("error", handleError);
            ws.off(WSMessageType.USER_ONLINE, handleUserOnline);
            ws.off(WSMessageType.USER_OFFLINE, handleUserOffline);
            ws.off(WSMessageType.USER_LIST_UPDATE, handleUserListUpdate);
            ws.off("request_online_users", fetchOnlineUsers);
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
    handleUserOnline,
    handleUserOffline,
    handleUserListUpdate,
  ]);

  // 更新页面标题
  useEffect(() => {
    document.title = `万象魔法学院 - ${username || "未登录"}`;
    return () => {
      document.title = "万象魔法学院";
    };
  }, [username]);

  // 修改获取在线用户列表的函数
  useEffect(() => {
    fetchOnlineUsers();
    // 减少轮询间隔到 10 秒,因为这是实时在线用户
    const interval = setInterval(fetchOnlineUsers, 10000);

    return () => clearInterval(interval);
  }, [fetchOnlineUsers]);

  // 修改消息渲染部分
  const renderMessage = (msg: Message) => {
    const messageClass = {
      chat: "bg-white/5",
      system: "bg-gray-700/50 text-gray-300",
      interaction: classNames("transition-all", {
        "bg-primary/10 border border-primary/20": msg.status === "active" && msg.duration,
        "bg-white/5": msg.status === "instant" || !msg.duration,
        "bg-white/5 opacity-75": msg.status === "completed",
      }),
      roomUpdate: "bg-green-500",
      heartbeat: "bg-blue-500",
    }[msg.type];

    // 使用初始化时记录的剩余持续时间
    const remainingDuration = msg.initialRemaining || 0;

    return (
      <div className={`message m-2 p-2 rounded ${messageClass}`}>
        <span
          className="username text-primary font-bold mr-2 cursor-pointer hover:underline"
          onClick={() => msg.initiatorId && setSelectedUserId(msg.initiatorId)}
        >
          {msg.username}
        </span>

        <span className="content text-white">{msg.content}</span>

        {msg.type === "interaction" &&
          msg.duration &&
          msg.status === "active" && (
            <div className="mt-2 h-1 bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-primary animate-progress"
                style={
                  {
                    "--duration": `${remainingDuration}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          )}

        {msg.type === "interaction" && msg.messageId && (
          <div className="mt-2">
            {generatingCGMessages.includes(msg.messageId) ? (
              <button
                disabled
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                生成中...
              </button>
            ) : (
              <button
                onClick={() => handleGenerateCG(msg.messageId)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                生成CG图片
              </button>
            )}
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
            周围的人 ({onlineUsers.length})
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="text-white text-sm p-2 rounded bg-white/5 hover:bg-white/10 transition cursor-pointer"
                onClick={() => setSelectedUserId(user.id)}
              >
                {user.nickname}
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
        <UserProfileCard userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      {cgModalVisible && cgImageUrl && (
        <CGModal imageUrl={cgImageUrl} onClose={() => setCgModalVisible(false)} />
      )}
    </div>
  );
};

export default ChatRoom;
