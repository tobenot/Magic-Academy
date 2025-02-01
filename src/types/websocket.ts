export interface UserOnlineEvent {
  data: {
    id: number;
    username: string;
  };
}

export interface UserOfflineEvent {
  data: {
    id: number;
  };
}

export interface UserListUpdateEvent {
  data: {
    users: Array<{
      id: number;
      username: string;
    }>;
  };
}
