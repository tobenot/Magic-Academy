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

  // 新增移动端适配状态
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
          container: "bg-mud-bg border-l-4 border-mud-muted",
          username: "text-mud-muted",
          prefix: "[SYS 系统]"
        };
      } else if (isManagerMessage) {
        return {
          container: "bg-mud-panel border-l-4 border-primary",
          username: "text-primary",
          prefix: "[GM 管理]"
        };
      } else {
        return {
          container: "bg-mud-bg border-l-4 border-secondary",
          username: "text-secondary",
          prefix: "[PLY 玩家]"
        };
      }
    };

    const messageStyle = getMessageStyle();
    const isInteraction = msg.type === WSMessageType.INTERACTION;

    return (
      <div className={classNames(
        "border border-mud-border p-2 lg:p-3 mb-2 font-mono",
        messageStyle.container,
        {
          "border-mud-warning bg-mud-warning/10": isPrivateMessageToCurrentUser,
          "border-accent bg-accent/10": isInteraction && msg.status === "active" && msg.duration
        }
      )}>
        {/* Private message indicator */}
        {isPrivateMessageToCurrentUser && (
          <div className="text-xs text-mud-warning font-bold mb-1">
            <span className="hidden sm:inline">*** PRIVATE MESSAGE 私信 ***</span>
            <span className="sm:hidden">*** 私信 ***</span>
          </div>
        )}

        {/* Message Header */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center space-x-1 lg:space-x-2 min-w-0 flex-1">
            <span className="text-mud-muted shrink-0">{messageStyle.prefix}</span>
            <span
              className={classNames(
                "font-bold truncate",
                messageStyle.username,
                {
                  "cursor-pointer hover:underline": 
                    !!msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage
                }
              )}
              onClick={() => {
                if (msg.initiatorId && msg.initiatorId !== 0 && !isManagerMessage) {
                  console.log("Clicked on user:", msg.username, msg.initiatorId);
                }
              }}
            >
              {msg.username?.toUpperCase()}
            </span>
          </div>
          <span className="text-mud-muted shrink-0 text-xs">
            {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Message Content */}
        <div className="text-mud-text leading-relaxed mb-2 text-xs lg:text-sm break-words">
          {msg.content}
        </div>

        {/* Interaction Progress Bar */}
        {isInteraction && msg.duration && msg.status === "active" && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-mud-muted mb-1">
              <span className="hidden sm:inline">ACTION IN PROGRESS 行动进行中</span>
              <span className="sm:hidden">进行中</span>
              <span>{Math.ceil(remainingDuration / 1000)}s</span>
            </div>
            <div className="h-2 bg-mud-bg border border-mud-border">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.max(0, (remainingDuration / (msg.duration || 1)) * 100)}%` }}
              >
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
                className="bg-mud-muted text-mud-text px-2 lg:px-3 py-1 border border-mud-border text-xs font-mono cursor-not-allowed"
              >
                <span className="hidden sm:inline">[ GENERATING... 生成中 ]</span>
                <span className="sm:hidden">生成中...</span>
              </button>
            ) : (
              <button
                onClick={() => handleGenerateCG(msg.messageId!)} 
                className="bg-mud-info text-white hover:bg-white hover:text-mud-info px-2 lg:px-3 py-1 border border-mud-info text-xs font-mono font-bold transition-colors"
              >
                <span className="hidden sm:inline">[ GENERATE CG 生成图片 ]</span>
                <span className="sm:hidden">生成图片</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

    return (
    <div className="chat-container flex flex-col h-screen bg-mud-bg text-mud-text font-mono overflow-hidden">
      {/* Mobile Top Character Bar - 移动端顶部角色信息条 */}
      <div className="lg:hidden bg-mud-panel border-b border-mud-border p-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex items-center space-x-2 bg-mud-bg hover:bg-mud-border border border-mud-border px-3 py-1 transition-colors"
          >
            <div className="w-4 h-4 flex flex-col justify-center space-y-1">
              <div className="h-0.5 bg-mud-text"></div>
              <div className="h-0.5 bg-mud-text"></div>
              <div className="h-0.5 bg-mud-text"></div>
            </div>
            <span className="text-xs">CHARACTER 角色</span>
          </button>
          
          {characterInfo && (
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-mud-danger">HP</span>
                <div className="w-12 h-2 bg-mud-bg border border-mud-border">
                  <div 
                    className="h-full bg-mud-danger" 
                    style={{ width: `${(characterInfo.dynamicProperties.hp / characterInfo.dynamicProperties.maxHp) * 100}%` }}
                  ></div>
                </div>
                <span className="text-mud-muted">{characterInfo.dynamicProperties.hp}/{characterInfo.dynamicProperties.maxHp}</span>
              </div>
              <button
                onClick={() => setIsSheetVisible(true)}
                className="bg-primary text-mud-bg px-2 py-1 hover:bg-secondary transition-colors"
              >
                SHEET 详情
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Environment Info Panel */}
      <div className="bg-mud-panel border-b-2 border-mud-border p-2 lg:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="text-primary animate-blink">●</div>
              <h2 className="text-sm lg:text-xl font-bold text-primary">
                <span className="hidden sm:inline">ENVIRONMENT 环境: </span>
                {currentManagerInfo ? currentManagerInfo.type.toUpperCase() : "LOADING... 加载中"}
              </h2>
              {isFetchingManagerInfo && (
                <div className="text-primary animate-blink text-xs lg:text-sm">[ LOADING 加载中 ]</div>
              )}
            </div>
            {username && (
              <div className="flex items-center space-x-2 lg:space-x-3 bg-mud-bg border border-mud-border px-2 lg:px-3 py-1 self-start lg:self-auto">
                <div className="text-mud-success">●</div>
                <span className="text-xs lg:text-sm text-mud-text">
                  <span className="hidden sm:inline">USER 用户: </span>
                  {username.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {currentManagerInfo ? (
            <div className="mt-2 lg:mt-4 grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
              <div className="bg-mud-bg border border-mud-border p-2 lg:p-3 order-2 lg:order-1">
                <div className="text-xs text-mud-muted mb-1">ENV_ID 环境ID:</div>
                <p className="text-mud-text text-xs lg:text-sm font-mono break-all">{currentManagerInfo.managerId}</p>
              </div>
              <div className="bg-mud-bg border border-mud-border p-2 lg:p-3 order-1 lg:order-2">
                <div className="text-xs text-mud-muted mb-1">DESCRIPTION 描述:</div>
                <p className="text-mud-text text-xs lg:text-sm">{currentManagerInfo.description}</p>
              </div>
              {currentManagerInfo.dynamicDescription && (
                <div className="lg:col-span-2 bg-mud-bg border border-accent p-2 lg:p-3 order-3">
                  <div className="text-xs text-accent mb-1">DYNAMIC_STATUS 动态状况:</div>
                  <p className="text-mud-text text-xs lg:text-sm">{currentManagerInfo.dynamicDescription}</p>
                </div>
              )}
            </div>
          ) : (
            !isFetchingManagerInfo && (
              <div className="mt-2 lg:mt-4 bg-mud-bg border border-mud-danger p-2 lg:p-3">
                <div className="text-mud-danger text-xs lg:text-sm">*** ERROR 错误: FAILED TO LOAD ENVIRONMENT INFO 无法加载环境信息 ***</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-mud-warning/20 border-b border-mud-warning p-2 lg:p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 lg:space-x-3">
            <div className="text-mud-warning animate-blink text-xs lg:text-sm">[ CONNECTING 连接中 ]</div>
            <span className="text-mud-warning font-bold text-xs lg:text-sm text-center">
              <span className="hidden sm:inline">CONNECTING TO SERVER... 正在连接服务器</span>
              <span className="sm:hidden">连接中...</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 max-w-7xl mx-auto w-full relative">
        {/* Desktop Character Status Panel */}
        <div className="hidden lg:block w-80 shrink-0 p-4">
          <CharacterStatusPanel 
            character={characterInfo} 
            onShowSheet={() => setIsSheetVisible(true)} 
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="relative w-80 max-w-[85vw] bg-mud-bg border-r-2 border-mud-border p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary font-bold">CHARACTER INFO 角色信息</h3>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="bg-mud-danger text-white px-2 py-1 text-xs hover:bg-white hover:text-mud-danger transition-colors"
                >
                  ✕ CLOSE 关闭
                </button>
              </div>
              <CharacterStatusPanel 
                character={characterInfo} 
                onShowSheet={() => {
                  setIsSheetVisible(true);
                  setIsMobileSidebarOpen(false);
                }} 
              />
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-mud-panel border-2 border-mud-border overflow-hidden lg:mx-4 mx-2 my-2 lg:my-4">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-2 lg:p-4 min-h-0">
            {messages.map((msg: Message) => (
              <div key={msg.messageId || msg.timestamp.toString() + msg.username}>
                {renderMessage(msg)}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-mud-muted space-y-2 lg:space-y-4">
                <div className="text-2xl lg:text-4xl text-center">[ MUD TERMINAL 终端 ]</div>
                <p className="text-xs lg:text-sm text-center px-4">ENTER COMMAND TO BEGIN ADVENTURE 输入指令开始冒险</p>
                <p className="text-xs text-mud-muted text-center px-4">TYPE ACTION IN INPUT FIELD BELOW 在下方输入框中输入行动</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-mud-bg border-t-2 border-mud-border p-2 lg:p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={connected ? "Enter command... 输入指令" : "Connecting... 连接中"}
                  disabled={!connected || isSubmittingAction}
                  className="w-full p-2 lg:p-2 bg-mud-panel text-mud-text border border-mud-border focus:border-primary focus:outline-none disabled:opacity-50 font-mono placeholder-mud-muted text-sm lg:text-base"
                />
                <div className="hidden lg:block absolute right-2 top-1/2 transform -translate-y-1/2 text-mud-muted">
                  <span className="text-xs">[ENTER 回车]</span>
                </div>
              </div>
              <button
                onClick={submitPlayerAction}
                disabled={!connected || isSubmittingAction || !inputMessage.trim()}
                className="px-2 lg:px-4 py-2 bg-primary text-mud-bg hover:bg-secondary hover:text-mud-bg border border-primary font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm"
              >
                <span className="hidden sm:inline">
                  {isSubmittingAction ? "[ SENDING... 发送中 ]" : "[ SEND 发送 ]"}
                </span>
                <span className="sm:hidden">
                  {isSubmittingAction ? "发送中" : "发送"}
                </span>
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
