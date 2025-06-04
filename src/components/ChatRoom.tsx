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

// New interface for Manager Information
interface ManagerInfo {
  managerId: string;
  type: string;
  description: string;
  dynamicDescription: string;
}

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
  managerId?: string;
  targetUserId?: string;
}


const ChatRoom = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  const authService = useMemo(() => new AuthService(), []);

  const [cgModalVisible, setCgModalVisible] = useState<boolean>(false);
  const [cgImageUrl, setCgImageUrl] = useState<string | null>(null);
  const [generatingCGMessages, setGeneratingCGMessages] = useState<string[]>([]);

  const [currentManagerInfo, setCurrentManagerInfo] = useState<ManagerInfo | null>(null);
  const [isFetchingManagerInfo, setIsFetchingManagerInfo] = useState<boolean>(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const fetchCurrentManagerInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("fetchCurrentManagerInfo: 用户未认证，无法获取管理器信息。");
      return;
    }
    setIsFetchingManagerInfo(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/game/player/current-manager`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data: ManagerInfo = await response.json();
        setCurrentManagerInfo(data);
      } else {
        let errorData: any = { message: "获取管理器信息时HTTP请求失败。" };
        try {
          errorData = await response.json();
        } catch (e) {
          console.warn("fetchCurrentManagerInfo: response.json() failed after non-ok HTTP status.");
        }
        console.error(
          `fetchCurrentManagerInfo: 获取管理器信息失败。状态码: ${response.status} (${response.statusText || 'N/A'}). `,
          "错误详情:", errorData
        );
        setCurrentManagerInfo(null);
      }
    } catch (error: any) {
      console.error(
        "fetchCurrentManagerInfo: 执行获取管理器信息请求时发生意外错误。",
        "错误信息:", error.message || "未知错误",
        "错误堆栈:", error.stack || "N/A",
        "完整错误对象:", error
      );
      setCurrentManagerInfo(null);
    } finally {
      setIsFetchingManagerInfo(false);
    }
  }, []);

  const submitPlayerAction = useCallback(async (): Promise<void> => {
    if (!wsService || !inputMessage.trim()) {
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("用户未认证，无法提交行动。");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/game/player/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ actionText: inputMessage.trim() }),
        }
      );

      if (response.status === 202) {
        const responseData = await response.json();
        console.log("行动已提交:", responseData);
        setInputMessage("");
      } else {
        const errorData = await response.json().catch(() => ({ message: "提交行动失败，请稍后再试。" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("提交行动失败:", error);
      alert(`提交行动失败: ${error.message}`);
    } finally {
      setIsSubmittingAction(false);
    }
  }, [inputMessage, wsService]);

  const handleMessage = useCallback((message: WSServerMessage) => {
    const messageData = message.data as WSMessageData & { managerId?: string; targetUserId?: string };

    switch (message.type) {
      case WSMessageType.CHAT:
        setMessages((prev) => [
          ...prev,
          {
            type: messageData.type,
            messageId: message.messageId,
            username: messageData.initiatorName || "未知用户",
            content: messageData.message,
            timestamp: message.timestamp,
            initiatorId: messageData.initiatorId,
            managerId: messageData.managerId,
            targetUserId: messageData.targetUserId,
          },
        ]);
        break;

      case WSMessageType.CHAT_HISTORY: {
        const historyData = message.data as WSChatHistoryData;
        if (Array.isArray(historyData.messages)) {
          const historyMessages = historyData.messages.map((msgEntry: WSServerMessage) => {
            const entryData = msgEntry.data as WSMessageData & { managerId?: string; targetUserId?: string };
            return {
              type: entryData.type,
              messageId: msgEntry.messageId,
              username:
                entryData.initiatorName ||
                (entryData.type === "system" ? "System" : "未知用户"),
              content: entryData.message,
              timestamp: msgEntry.timestamp,
              initiatorId: entryData.initiatorId,
              actionId: entryData.actionId,
              status: entryData.status,
              duration:
                entryData.duration && entryData.duration > 0
                  ? entryData.duration
                  : undefined,
              targetId: entryData.targetId,
              targetName: entryData.targetName,
              startTime: entryData.startTime,
              initialRemaining:
                entryData.duration && entryData.startTime
                  ? Math.max(entryData.duration - (Date.now() - entryData.startTime), 0)
                  : undefined,
              managerId: entryData.managerId,
              targetUserId: entryData.targetUserId,
            };
          });
          setMessages((prev) => [...historyMessages, ...prev]);
        }
        break;
      }

      case WSMessageType.INTERACTION: 
        const interactionData = message.data as WSMessageData & { managerId?: string; targetUserId?: string };
        setMessages((prev) => [
          ...prev,
          {
            type: interactionData.type,
            messageId: message.messageId,
            username: interactionData.initiatorName || "未知用户",
            content: interactionData.message,
            timestamp: message.timestamp,
            actionId: interactionData.actionId,
            status: interactionData.status,
            duration: interactionData.duration,
            startTime: interactionData.startTime,
            initialRemaining: interactionData.duration && interactionData.startTime 
                                ? Math.max(interactionData.duration - (Date.now() - interactionData.startTime), 0)
                                : undefined,
            initiatorId: interactionData.initiatorId,
            targetId: interactionData.targetId,
            targetName: interactionData.targetName,
            managerId: interactionData.managerId,
            targetUserId: interactionData.targetUserId,
          },
        ]);
        break;

      case WSMessageType.SYSTEM:
        const systemData = message.data as WSMessageData & { managerId?: string; targetUserId?: string };
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            messageId: message.messageId,
            username: "System",
            content: systemData.message,
            timestamp: message.timestamp,
            initiatorId: systemData.initiatorId,
            managerId: systemData.managerId,
            targetUserId: systemData.targetUserId,
          },
        ]);
        break;
    }
  }, []);

  const handleConnected = useCallback(() => {
    console.log("WebSocket 已连接");
    setConnected(true);
    fetchCurrentManagerInfo();
  }, [fetchCurrentManagerInfo]);

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
      submitPlayerAction();
    }
  }, [submitPlayerAction]);

  const handleGenerateCG = useCallback(async (interactionMessageId: string) => {
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
      setCgImageUrl(imageUrl);
      setCgModalVisible(true);
    } catch (error: any) {
      console.error("生成CG图片失败:", error);
      alert("生成CG图片失败: " + error.message);
    } finally {
      setGeneratingCGMessages((prev) =>
        prev.filter((id) => id !== interactionMessageId)
      );
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user && typeof user === "object" && "nickname" in user && typeof user.nickname === 'string') {
          setUsername(user.nickname);
          const ws = WebSocketService.getInstance();
          setWsService(ws);

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
        } else {
          console.error("Invalid user data or nickname:", user);
          authService.logout();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
      }
    };
    checkAuth();
  }, [
    authService,
    handleMessage, 
    handleConnected,
    handleDisconnect, 
    handleError
  ]);

  useEffect(() => {
    document.title = `万象魔法学院 - ${username || "未登录"}`;
    return () => {
      document.title = "万象魔法学院";
    };
  }, [username]);

  const renderMessage = (msg: Message) => {
    let messageBaseStyle = "bg-white/5";
    let userNameStyle = "text-primary";
    const isManagerMessage = msg.username?.startsWith("Manager") || msg.initiatorId === 0;
    const currentUserId = localStorage.getItem("userId");
    const isPrivateMessageToCurrentUser = msg.targetUserId && msg.targetUserId === currentUserId;

    if (msg.type === "system") {
      messageBaseStyle = "bg-gray-700/50 text-gray-300";
      userNameStyle = "text-gray-400 font-bold";
    } else if (isManagerMessage) {
      messageBaseStyle = "bg-indigo-900/30 text-indigo-200 italic";
      userNameStyle = "text-indigo-400 font-bold";
    }

    if (isPrivateMessageToCurrentUser) {
        messageBaseStyle = classNames(messageBaseStyle, "border-l-2 border-yellow-400 pl-1");
    }

    const messageClasses = {
      chat: messageBaseStyle,
      system: messageBaseStyle,
      interaction: classNames("transition-all", messageBaseStyle, {
        "bg-primary/10 border border-primary/20": msg.status === "active" && msg.duration,
      }),
    };

    const finalStyle = msg.type === WSMessageType.INTERACTION 
                       ? messageClasses.interaction 
                       : messageBaseStyle;

    const remainingDuration = msg.initialRemaining || 0;

    return (
      <div className={classNames("message m-2 p-2 rounded", finalStyle)}>
        <span
          className={classNames("username font-bold mr-2", userNameStyle, {"cursor-pointer hover:underline": !!msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage})}
          onClick={() => {
            if (msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage) {
              console.log("Clicked on user:", msg.username, msg.initiatorId);
            }
          }}
        >
          {msg.username}
        </span>
        <span className="content text-white">{msg.content}</span>
        {msg.type === WSMessageType.INTERACTION &&
          msg.duration &&
          msg.status === "active" && (
            <div className="mt-2 h-1 bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-primary animate-progress"
                style={{ "--duration": `${remainingDuration}ms` } as React.CSSProperties}
              />
            </div>
          )}
        {msg.type === WSMessageType.INTERACTION && msg.messageId && (
          <div className="mt-2">
            {generatingCGMessages.includes(msg.messageId) ? (
              <button
                disabled
                className="px-3 py-1 bg-blue-500 text-white rounded opacity-50 cursor-not-allowed"
              >
                生成中...
              </button>
            ) : (
              <button
                onClick={() => handleGenerateCG(msg.messageId!)} 
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
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
    <div className="chat-container flex flex-col h-screen p-5 bg-black/80 text-white">
      <div className="manager-info bg-black/50 p-3 rounded mb-4">
        <h2 className="text-xl font-bold text-accent mb-2">
          当前环境: {currentManagerInfo ? currentManagerInfo.type : "加载中..."}
          {isFetchingManagerInfo && <span className="ml-2 text-sm text-gray-400">(正在加载...)</span>}
        </h2>
        {currentManagerInfo ? (
          <>
            <p className="text-gray-300"><span className="font-semibold text-gray-100">ID:</span> {currentManagerInfo.managerId}</p>
            <p className="mt-1"><span className="font-semibold text-gray-100">描述:</span> {currentManagerInfo.description}</p>
            <p className="mt-1 text-sky-300"><span className="font-semibold text-sky-100">动态:</span> {currentManagerInfo.dynamicDescription}</p>
          </>
        ) : (
          !isFetchingManagerInfo && <p className="text-gray-400">未能加载环境信息。</p>
        )}
      </div>

      {!connected && (
        <div className="text-yellow-500 text-center mb-2">
          正在连接服务器...
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {username && (
            <div className="text-white text-sm mb-2">当前用户：{username}</div>
          )}
          <div className="chat-messages flex-1 overflow-y-auto mb-5 p-3 bg-white/10 rounded-lg min-h-0">
            {messages.map((msg: Message) => (
              <div key={msg.messageId || msg.timestamp.toString() + msg.username}>{renderMessage(msg)}</div> 
            ))}
          </div>
          <div className="chat-input flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={connected ? "输入行动指令..." : "正在连接..."}
              disabled={!connected || isSubmittingAction}
              className="flex-1 p-2 rounded bg-white/10 text-white border border-white/20 disabled:opacity-50"
            />
            <button
              onClick={submitPlayerAction}
              disabled={!connected || isSubmittingAction || !inputMessage.trim()}
              className="px-4 py-2 bg-primary hover:bg-secondary text-black rounded transition disabled:opacity-50"
            >
              {isSubmittingAction ? "提交中..." : "提交行动"}
            </button>
          </div>
        </div>
      </div>

      {cgModalVisible && cgImageUrl && (
        <CGModal imageUrl={cgImageUrl} onClose={() => setCgModalVisible(false)} />
      )}
    </div>
  );
};

export default ChatRoom;
