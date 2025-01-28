interface UserCredentials {
  username: string
  password: string
}

interface ApiResponse {
  message: string
  token?: string
}

export class AuthService {
  private readonly apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/['"]/g, '') ?? ''
  }

  private async makeRequest(endpoint: string, credentials: UserCredentials): Promise<ApiResponse> {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return response.json()
  }

  async login(credentials: UserCredentials): Promise<ApiResponse> {
    return this.makeRequest('/login', credentials)
  }

  async register(credentials: UserCredentials): Promise<ApiResponse> {
    return this.makeRequest('/register', credentials)
  }
} 