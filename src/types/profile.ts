export interface UserProfile {
  id: number;
  nickname: string;
  title?: string;
  avatar?: string;
  cardImage: string;
  joinDate: number;
  lastActive: number;
  status: "online" | "offline" | "away";
  bio?: string;
  statistics?: {
    totalOnlineTime?: number;
    messageCount?: number;
  };
}

export interface ProfileCache {
  [userId: number]: {
    data: UserProfile;
    timestamp: number;
  };
}

export interface WSProfileMessage {
  type: "profile_update";
  timestamp: number;
  data: UserProfile;
}
