// 类型定义
interface ApiResponse {
  message: string;
  [key: string]: any;
}

interface UserCredentials {
  username: string;
  password: string;
}

// 环境变量类型声明
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }
}

class AuthService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || "";
    console.log("Initial API_BASE_URL:", this.apiBaseUrl);
  }

  private getFormData(): UserCredentials {
    const username = (document.getElementById("username") as HTMLInputElement)
      ?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;

    if (!username || !password) {
      throw new Error("用户名和密码不能为空");
    }

    return { username, password };
  }

  private async makeRequest(
    endpoint: string,
    credentials: UserCredentials,
  ): Promise<ApiResponse> {
    const requestUrl = `${this.apiBaseUrl}${endpoint}`;
    console.log("构建的请求URL:", requestUrl);

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  private handleGameStart(): void {
    const authContainer = document.getElementById("auth-container");
    const mainMenu = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");

    if (authContainer) authContainer.style.display = "none";
    if (mainMenu) mainMenu.style.display = "none";
    if (gameContainer) gameContainer.style.display = "block";

    if (typeof window.startGame === "function") {
      window.startGame();
    } else {
      console.error("startGame 函数未定义");
    }
  }

  public async register(event: Event): Promise<void> {
    event.preventDefault();

    try {
      const credentials = this.getFormData();
      const data = await this.makeRequest("/register", credentials);
      alert(data.message);
    } catch (error) {
      console.error("Error:", error);
      alert("注册失败，请重试");
    }
  }

  public async login(event: Event): Promise<void> {
    event.preventDefault();

    try {
      const credentials = this.getFormData();
      const data = await this.makeRequest("/login", credentials);
      alert(data.message);

      if (data.message === "登录成功") {
        this.handleGameStart();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("登录失败，请重试");
    }
  }
}

// 为window添加startGame类型声明
declare global {
  interface Window {
    startGame?: () => void;
  }
}

// 初始化服务并添加事件监听器
const authService = new AuthService();

document
  .getElementById("register-button")
  ?.addEventListener("click", (e) => authService.register(e));

document
  .getElementById("login-button")
  ?.addEventListener("click", (e) => authService.login(e));
