export class MovementService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
  }

  async move(
    characterId: number,
    currentRoomId: string,
    targetRoomId: string,
    moveType: "normal" | "teleport" = "normal"
  ): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("未登录 - 无有效 token");
    }

    const response = await fetch(`${this.baseUrl}/movement/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        characterId,
        currentRoomId,
        targetRoomId,
        moveType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "角色移动失败");
    }
  }
} 