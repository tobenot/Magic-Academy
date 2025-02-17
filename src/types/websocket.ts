import { UserProfile } from './profile';

// 1. 消息类型枚举
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
    AVATAR_UPDATE = "avatar_update",

    // 内容消息
    CHAT = "chat",
    SYSTEM = "system",
    INTERACTION = "interaction",
    CHAT_HISTORY = "chat_history"
}

// 2. 用户信息类型
export interface WSUser {
    id: number;
    nickname: string;
    status: 'online' | 'offline' | 'away';
    lastActive: number;
}

// 3. 消息数据接口
export interface WSMessageData {
    // 基础字段 - 所有消息都需要
    type: 'chat' | 'system' | 'interaction' | 'roomUpdate' | 'heartbeat';
    message: string;
    
    // 新增扩展字段
    roomId?: string;            // 房间ID，用于局部消息广播
    event?: 'enter' | 'leave';  // 房间事件，例如角色进入或离开
    characterId?: number;       // 发生房间事件的角色ID
    
    // 可选字段 - 根据消息类型可能存在
    content?: string;             // 聊天内容
    initiatorId?: number;         // 发送者ID
    initiatorName?: string;       // 发送者名称
    actionId?: string;            // 动作ID
    targetId?: number;            // 目标ID
    targetName?: string;          // 目标名称
    status?: 'active' | 'completed' | 'instant';
    duration?: number;            // 持续时间
    startTime?: number;           // 持续性动作的开始时间
    code?: string;                // 错误代码
    details?: any;                // 详细信息
    users?: WSUser[];             // 用户列表
    profile?: UserProfile;        // 用户资料
    replyTo?: string;             // 回复消息ID
    hasMore?: boolean;            // 是否有更多消息
    lastId?: string;              // 最后消息ID
    online_count?: number;        // 在线用户数
}

// 4. 服务端基础消息接口
export interface WSBaseMessage<T extends WSMessageData = WSMessageData> {
    type: WSMessageType;
    timestamp: number;
    messageId: string;
    data: T;
}

// 5. 服务端消息类型，允许基础消息数据为 WSMessageData 或 WSChatHistoryData
export type WSServerMessage = WSBaseMessage<WSMessageData> | WSBaseMessage<WSChatHistoryData>;

// 6. 客户端消息格式
export interface WSClientMessage {
    type: WSMessageType;
    timestamp: number;
    data: {
        type: 'chat' | 'system' | 'interaction' | 'roomUpdate' | 'heartbeat';
        content?: string;
        actionId?: string;
        targetId?: number;
    };
}

// 7. 消息内容辅助类型
export interface MessageContent {
    type: 'chat' | 'interaction' | 'system';
    content?: string;
    actionId?: string;
    initiatorId: number;
    targetId?: number;
    duration?: number;
    status?: 'active' | 'completed' | 'instant';
    initiatorName: string;
    targetName?: string;
    message: string;
}

// 新增：用于传输历史消息的数据接口，扩展自 WSMessageData 以满足必填字段要求
export interface WSChatHistoryData extends WSMessageData {
    messages: WSServerMessage[];
}