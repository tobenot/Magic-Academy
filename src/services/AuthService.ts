interface UserCredentials {
  username: string;
  password: string;
  nickname?: string;
}

interface User {
  id: number;
  username: string;
}

interface LoginResponse {
  message: string;
  username: string;
  token: string;
  id: number;
}

interface OnlineUser {
  id: number;
  username: string;
}

export class AuthService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
  }

  private async makeRequest(
    endpoint: string,
    credentials: UserCredentials,
  ): Promise<LoginResponse> {
    let response: Response;
    try {
      response = await fetch(`${this.apiBaseUrl}/auth${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
    } catch (error: any) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error("无法链接到服务器，服务器可能未开启");
      }
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "请求失败，请重试");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      if (typeof data.id === "number") {
        localStorage.setItem("userId", data.id.toString());
      }
    }

    return data;
  }

  async login(credentials: UserCredentials): Promise<LoginResponse> {
    const { nickname, ...loginCredentials } = credentials;
    return this.makeRequest("/login", loginCredentials);
  }

  async register(credentials: UserCredentials): Promise<LoginResponse> {
    return this.makeRequest("/register", credentials);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await fetch(`${this.apiBaseUrl}/user/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("认证失败");
      }

      const user = await response.json();
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  }

  async getUserList(): Promise<User[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("未登录");

    const response = await fetch(`${this.apiBaseUrl}/user/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("获取用户列表失败");
    }

    return response.json();
  }

  async getOnlineUsers(): Promise<OnlineUser[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("未登录");

    const response = await fetch(`${this.apiBaseUrl}/user/online`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("获取在线用户列表失败");
    }

    return response.json();
  }
}
