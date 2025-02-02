// 1. 基础消息类型
export interface WSBaseMessage {
  type: WSMessageType; // 消息类型
  timestamp: number; // 时间戳
  messageId: string; // 消息唯一ID
  data: WSMessageData; // 消息数据
}

// 2. 消息类型枚举
export enum WSMessageType {
  // 系统消息
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  ERROR = "error",
  HEARTBEAT = "heartbeat",

  // 用户状态
  USER_ONLINE = "user_online",
  USER_OFFLINE = "user_offline",
  USER_LIST_UPDATE = "user_list_update",

  // 内容消息
  CHAT = "chat",
  SYSTEM = "system",
  INTERACTION = "interaction",

  // 新增的历史聊天消息类型（使用小写值与后端一致）
  CHAT_HISTORY = "chat_history",
}

// 3. 用户信息类型
export interface WSUser {
  id: number;
  username: string;
  status: "online" | "offline" | "away";
  lastActive: number;
}

// 4. 消息数据类型
export interface WSMessageData {
  // 基础消息内容
  message: string; // 显示文本
  type: "chat" | "system" | "interaction"; // 内容类型

  // 用户相关
  initiatorId?: number; // 发送者ID
  initiatorName?: string; // 发送者名称
  targetId?: number; // 目标用户ID
  targetName?: string; // 目标用户名称

  // 交互相关
  actionId?: string; // 动作ID
  status?: "active" | "completed" | "instant"; // 交互状态
  duration?: number; // 持续时间

  // 用户列表
  users?: WSUser[]; // 在线用户列表

  // 错误信息
  code?: string; // 错误代码
  details?: any; // 错误详情
}

// 新增: 历史聊天消息数据结构接口
export interface WSChatHistoryData {
  messages: Array<{
    type: "chat" | "system" | "interaction";
    message: string;
    timestamp: number;
    initiatorId?: number;
    initiatorName?: string;
    targetId?: number;
    targetName?: string;
    actionId?: string;
    status?: "active" | "completed" | "instant";
    duration?: number;
  }>;
}

// 5. 服务端消息类型
export type WSServerMessage = WSBaseMessage;

// 6. 客户端消息类型
export interface WSClientMessage {
  type: WSMessageType;
  timestamp: number;
  data: {
    content?: string; // 聊天内容
    actionId?: string; // 动作ID
    targetId?: number; // 目标用户ID
  };
}
