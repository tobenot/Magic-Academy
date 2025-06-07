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
import CharacterStatusPanel from './CharacterStatusPanel';
import CharacterSheetModal from './CharacterSheetModal';

// New interface for Manager Information
interface ManagerInfo {
  managerId: string;
  type: string;
  description: string;
  dynamicDescription: string;
}

// Full Character type based on API documentation
interface Character {
  id: number;
  nickname: string;
  staticProperties: { role: string; mbti: string; archetype: string; personality: string; traits: string; speech_style: string; goals: string; };
  dynamicProperties: { hp: number; maxHp: number; stamina: string; maxStamina: number; satiation: number; maxSatiation: number; hydration: number; maxHydration: number; appearance: string; current_mood: string; inventory: any[]; };
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number; };
  proficiencies: string[];
  contextLog: string[];
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

  // New states for character data and sheet visibility
  const [characterInfo, setCharacterInfo] = useState<Character | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);

  const fetchCharacterData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/character/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch character data');
      const data: Character = await response.json();
      setCharacterInfo(data);
    } catch (error) {
      console.error("获取角色数据失败:", error);
    }
  }, []);

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

    if (message.type === WSMessageType.CHAT && messageData.initiatorName?.startsWith("Manager")) {
      fetchCharacterData();
      fetchCurrentManagerInfo();
    }
    
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
  }, [fetchCharacterData, fetchCurrentManagerInfo]);

  const handleConnected = useCallback(() => {
    console.log("WebSocket 已连接");
    setConnected(true);
    fetchCurrentManagerInfo();
    fetchCharacterData();
  }, [fetchCurrentManagerInfo, fetchCharacterData]);

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
    const isManagerMessage = msg.username?.startsWith("Manager") || msg.initiatorId === 0;
    const currentUserId = localStorage.getItem("userId");
    const isPrivateMessageToCurrentUser = msg.targetUserId && msg.targetUserId === currentUserId;
    const remainingDuration = msg.initialRemaining || 0;

    // Message type styling
    const getMessageStyle = () => {
      if (msg.type === "system") {
        return {
          container: "bg-gradient-to-r from-gray-700/30 to-gray-800/40 border-l-4 border-gray-500",
          username: "text-gray-300",
          icon: "⚙️"
        };
      } else if (isManagerMessage) {
        return {
          container: "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-l-4 border-indigo-400",
          username: "text-indigo-300",
          icon: "🎭"
        };
      } else {
        return {
          container: "bg-gradient-to-r from-white/5 to-white/10 border-l-4 border-primary/30",
          username: "text-primary",
          icon: "👤"
        };
      }
    };

    const messageStyle = getMessageStyle();
    const isInteraction = msg.type === WSMessageType.INTERACTION;

    return (
      <div className={classNames(
        "group relative backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.01]",
        messageStyle.container,
        {
          "border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10": isPrivateMessageToCurrentUser,
          "ring-2 ring-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10": isInteraction && msg.status === "active" && msg.duration
        }
      )}>
        {/* Private message indicator */}
        {isPrivateMessageToCurrentUser && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            私信
          </div>
        )}

        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{messageStyle.icon}</span>
            <span
              className={classNames(
                "font-bold text-sm",
                messageStyle.username,
                {
                  "cursor-pointer hover:underline hover:scale-105 transition-transform duration-200": 
                    !!msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage
                }
              )}
              onClick={() => {
                if (msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage) {
                  console.log("Clicked on user:", msg.username, msg.initiatorId);
                }
              }}
            >
              {msg.username}
            </span>
            {isManagerMessage && (
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full font-medium">
                GM
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/50 font-mono">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
            {msg.type === "system" && (
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="text-white/90 leading-relaxed mb-3">
          {msg.content}
        </div>

        {/* Interaction Progress Bar */}
        {isInteraction && msg.duration && msg.status === "active" && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>进行中...</span>
              <span>{Math.ceil(remainingDuration / 1000)}s</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary animate-progress rounded-full"
                style={{ "--duration": `${remainingDuration}ms` } as React.CSSProperties}
              >
                <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* CG Generation Button */}
        {isInteraction && msg.messageId && (
          <div className="flex justify-end">
            {generatingCGMessages.includes(msg.messageId) ? (
              <button
                disabled
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/50 text-white/70 rounded-lg cursor-not-allowed"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">生成中...</span>
              </button>
            ) : (
              <button
                onClick={() => handleGenerateCG(msg.messageId!)} 
                className="group/btn flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                <span className="text-sm">🎨</span>
                <span className="text-sm font-medium">生成CG图片</span>
                <span className="group-hover/btn:translate-x-1 transition-transform duration-200">→</span>
              </button>
            )}
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  };

  return (
    <div className="chat-container flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Environment Info Panel */}
      <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/60 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                当前环境: {currentManagerInfo ? currentManagerInfo.type : "加载中..."}
              </h2>
              {isFetchingManagerInfo && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {username && (
              <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-white/90">当前用户：{username}</span>
              </div>
            )}
          </div>
          {currentManagerInfo ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-400">🏷️</span>
                  <span className="font-semibold text-blue-300">环境ID</span>
                </div>
                <p className="text-white/80 font-mono text-sm">{currentManagerInfo.managerId}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-400">📝</span>
                  <span className="font-semibold text-green-300">环境描述</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{currentManagerInfo.description}</p>
              </div>
              {currentManagerInfo.dynamicDescription && (
                <div className="md:col-span-2 bg-gradient-to-r from-sky-500/10 to-cyan-500/10 rounded-xl p-4 border border-sky-400/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sky-400">⚡</span>
                    <span className="font-semibold text-sky-300">动态状况</span>
                  </div>
                  <p className="text-sky-100 text-sm leading-relaxed">{currentManagerInfo.dynamicDescription}</p>
                </div>
              )}
            </div>
          ) : (
            !isFetchingManagerInfo && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-red-300">未能加载环境信息</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-400/20 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-yellow-300 font-medium">正在连接服务器...</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 p-6 min-h-0 max-w-7xl mx-auto w-full">
        {/* Character Status Panel */}
        <div className="w-80 shrink-0">
          <CharacterStatusPanel 
            character={characterInfo} 
            onShowSheet={() => setIsSheetVisible(true)} 
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-800/20 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 custom-scrollbar">
            {messages.map((msg: Message) => (
              <div key={msg.messageId || msg.timestamp.toString() + msg.username}>
                {renderMessage(msg)}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                <div className="text-6xl">💬</div>
                <p className="text-lg font-medium">开始你的冒险吧！</p>
                <p className="text-sm text-white/30">在下方输入你的行动指令</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/70 backdrop-blur-sm border-t border-white/10 p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={connected ? "输入你的行动指令..." : "正在连接..."}
                  disabled={!connected || isSubmittingAction}
                  className="w-full p-4 bg-white/5 backdrop-blur-sm text-white border border-white/20 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 transition-all duration-200 placeholder-white/40"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/30">
                  <span className="text-sm">Enter ↵</span>
                </div>
              </div>
              <button
                onClick={submitPlayerAction}
                disabled={!connected || isSubmittingAction || !inputMessage.trim()}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black rounded-xl transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center space-x-2">
                  {isSubmittingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>提交中...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>提交行动</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isSheetVisible && (
        <CharacterSheetModal 
          character={characterInfo} 
          onClose={() => setIsSheetVisible(false)} 
        />
      )}
      
      {cgModalVisible && cgImageUrl && (
        <CGModal imageUrl={cgImageUrl} onClose={() => setCgModalVisible(false)} />
      )}
    </div>
  );
};

export default ChatRoom;
