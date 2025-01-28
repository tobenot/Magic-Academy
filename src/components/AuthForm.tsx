import { useState } from 'react'
import { AuthService } from '../services/AuthService'

interface AuthFormProps {
  onLoginSuccess: () => void
}

const AuthForm = ({ onLoginSuccess }: AuthFormProps): JSX.Element => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (type: 'login' | 'register'): Promise<void> => {
    try {
      const authService = new AuthService()
      const response = await authService[type](credentials)
      
      alert(response.message)
      if (type === 'login' && response.message === '登录成功') {
        onLoginSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`${type === 'login' ? '登录' : '注册'}失败，请重试`)
    }
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-black/70 p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-cinzel text-primary mb-4">
        Heart World and the Magic Academy
      </h1>
      <h1 className="text-2xl font-noto-serif text-primary mb-8" lang="zh">
        心界与魔法学院
      </h1>
      
      <form className="space-y-4">
        <input
          type="text"
          placeholder="用户名"
          className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
        />
        <input
          type="password"
          placeholder="密码"
          className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        />
        
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => handleSubmit('register')}
            className="flex-1 py-2 px-4 bg-primary hover:bg-secondary text-black rounded transition"
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('login')}
            className="flex-1 py-2 px-4 bg-primary hover:bg-secondary text-black rounded transition"
          >
            登录
          </button>
        </div>
      </form>
    </div>
  )
}

export default AuthForm 