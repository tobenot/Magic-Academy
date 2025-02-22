export interface RoomInfo {
  id: string;
  name: string;
  description: string;
  connections: {
    targetRoomId: string;
    direction: string;
  }[];
}

export class MapService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
  }

  async getMap(roomId?: string): Promise<RoomInfo> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("未登录 - 无有效 token");
    }

    let url = `${this.baseUrl}/map`;
    if (roomId) {
      url += `?roomId=${encodeURIComponent(roomId)}`;
    }

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.room;
  }
} 