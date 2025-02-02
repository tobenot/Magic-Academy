// 1. 基础消息类型
export interface BaseWSMessage {
  type: WSMessageType;
  timestamp: number;
  sequence?: number; // 添加消息序列号，用于消息排序和重传
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

  // 聊天消息
  CHAT = "chat",
  HISTORY = "history",
}

// 3. 用户信息类型
export interface WSUser {
  id: number;
  username: string;
  status?: "online" | "offline" | "away"; // 添加用户状态
  lastActive?: number; // 最后活跃时间
}

// 4. 错误消息类型
export interface WSErrorMessage extends BaseWSMessage {
  type: WSMessageType.ERROR;
  code: string; // 错误代码
  message: string; // 错误描述
  details?: any; // 详细信息
}

// 5. 系统消息类型
export interface WSSystemMessage extends BaseWSMessage {
  type:
    | WSMessageType.CONNECT
    | WSMessageType.DISCONNECT
    | WSMessageType.HEARTBEAT;
  data?: {
    reason?: string;
    reconnectDelay?: number;
  };
}

// 6. 聊天消息类型
export interface WSChatMessage extends BaseWSMessage {
  type: WSMessageType.CHAT;
  content: string;
  username: string;
  messageId?: string; // 消息唯一ID
  replyTo?: string; // 回复消息ID
}

// 7. 历史消息类型
export interface WSHistoryMessage extends BaseWSMessage {
  type: WSMessageType.HISTORY;
  messages: WSChatMessage[];
  hasMore: boolean; // 是否还有更多历史消息
  lastId?: string; // 最后一条消息ID，用于分页
}

// 8. 用户状态消息类型
export interface WSUserStatusMessage extends BaseWSMessage {
  type: WSMessageType.USER_ONLINE | WSMessageType.USER_OFFLINE;
  data: WSUser;
  online_count: number;
}

// 9. 用户列表更新消息
export interface WSUserListMessage extends BaseWSMessage {
  type: WSMessageType.USER_LIST_UPDATE;
  data: {
    users: WSUser[];
    total: number;
  };
  online_count: number;
}

// 10. 服务端消息联合类型
export type WSServerMessage =
  | WSSystemMessage
  | WSErrorMessage
  | WSUserStatusMessage
  | WSUserListMessage
  | WSChatMessage
  | WSHistoryMessage;

// 11. 客户端消息类型
export type WSClientMessage = WSSystemMessage | WSChatMessage;
