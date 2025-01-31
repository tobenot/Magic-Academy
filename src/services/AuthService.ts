interface UserCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  username: string;
  token: string;
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
    const response = await fetch(`${this.apiBaseUrl}/auth${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
    }

    return data;
  }

  async login(credentials: UserCredentials): Promise<LoginResponse> {
    return this.makeRequest("/login", credentials);
  }

  async register(credentials: UserCredentials): Promise<LoginResponse> {
    return this.makeRequest("/register", credentials);
  }

  async getCurrentUser(): Promise<{ username: string } | null> {
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

      return response.json();
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  }

  async getUserList(): Promise<Array<{ username: string }>> {
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
}
