// 1. 基础消息类型
export interface BaseWSMessage {
  type: WSMessageType;
  timestamp: number;
  sequence?: number; // 添加消息序列号，用于消息排序和重传
}

// 2. 消息内容类型
export interface MessageContent {
  type: "chat" | "interaction" | "system";
  content?: string;
  actionId?: string;
  initiatorId: number;
  targetId?: number;
  duration?: number;
  status?: InteractionStatus;
  initiatorName: string;
  targetName?: string;
  message: string;
}

// 3. 统一服务端消息格式
export interface WSServerMessage extends BaseWSMessage {
  data: MessageContent;
  messageId?: string;
  replyTo?: string;
}

// 4. 消息类型枚举
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
  INTERACTION = "interaction",
}

// 5. 用户信息类型
export interface WSUser {
  id: number;
  username: string;
  status?: "online" | "offline" | "away"; // 添加用户状态
  lastActive?: number; // 最后活跃时间
}

// 6. 错误消息类型
export interface WSErrorMessage extends BaseWSMessage {
  type: WSMessageType.ERROR;
  code: string; // 错误代码
  message: string; // 错误描述
  details?: any; // 详细信息
}

// 7. 系统消息类型
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

// 8. 聊天消息类型
export interface WSChatMessage extends BaseWSMessage {
  type: WSMessageType.CHAT;
  content: string;
  username: string;
  messageId?: string; // 消息唯一ID
  replyTo?: string; // 回复消息ID
}

// 9. 历史消息类型
export interface WSHistoryMessage extends BaseWSMessage {
  type: WSMessageType.HISTORY;
  messages: WSChatMessage[];
  hasMore: boolean; // 是否还有更多历史消息
  lastId?: string; // 最后一条消息ID，用于分页
}

// 10. 用户状态消息类型
export interface WSUserStatusMessage extends BaseWSMessage {
  type: WSMessageType.USER_ONLINE | WSMessageType.USER_OFFLINE;
  data: WSUser;
  online_count: number;
}

// 11. 用户列表更新消息
export interface WSUserListMessage extends BaseWSMessage {
  type: WSMessageType.USER_LIST_UPDATE;
  data: {
    users: WSUser[];
    total: number;
  };
  online_count: number;
}

// 12. 交互消息数据结构
export interface WSInteractionData {
  actionId: string;
  initiatorId: number;
  targetId: number;
  duration?: number;
  status: "active" | "completed";
  initiatorName: string;
  targetName: string;
  message: string;
}

// 13. 交互消息类型
export interface WSInteractionMessage extends BaseWSMessage {
  type: WSMessageType.INTERACTION_UPDATE;
  data: WSInteractionData;
}

// 14. 交互开始消息类型
export interface WSInteractionStartMessage extends BaseWSMessage {
  type: WSMessageType.INTERACTION_START;
  actionId: string;
  targetId: number;
}

// 15. 客户端消息类型（发送到服务器的消息）
export interface WSClientMessage extends BaseWSMessage {
  content?: string;
  actionId?: string;
  targetId?: number;
}

// 16. 服务端消息联合类型
export type WSServerMessage =
  | WSSystemMessage
  | WSErrorMessage
  | WSUserStatusMessage
  | WSUserListMessage
  | WSChatMessage
  | WSHistoryMessage
  | WSInteractionMessage
  | WSInteractionStartMessage;

// 客户端交互消息类型
export interface WSClientInteractionMessage {
  type: WSMessageType.INTERACTION;
  data: {
    actionId: string;
    targetId?: number; // 某些动作可选
  };
}

// 更新客户端消息联合类型
export type WSClientMessage =
  | WSClientChatMessage
  | WSClientInteractionMessage
  | WSSystemMessage;

// 修改动作状态类型
export type InteractionStatus = "active" | "completed" | "instant";
