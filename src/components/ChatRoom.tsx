import { useState, ChangeEvent, KeyboardEvent } from 'react'

interface Message {
  username: string
  content: string
  timestamp: number
}

const ChatRoom = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')

  const sendMessage = (): void => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      username: 'User', // 后续从登录信息获取
      content: inputMessage.trim(),
      timestamp: Date.now()
    }

    setMessages([...messages, newMessage])
    setInputMessage('')
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputMessage(e.target.value)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="chat-container flex flex-col h-screen p-5 bg-black/80">
      <div className="chat-messages flex-1 overflow-y-auto mb-5 p-3 bg-white/10 rounded-lg">
        {messages.map((msg: Message, index: number) => (
          <div key={index} className="message m-2 p-2 bg-white/5 rounded">
            <span className="username text-primary font-bold mr-2">{msg.username}</span>
            <span className="content text-white">{msg.content}</span>
          </div>
        ))}
      </div>
      
      <div className="chat-input flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          className="flex-1 p-2 rounded bg-white/10 text-white border border-white/20"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-primary hover:bg-secondary text-black rounded transition"
        >
          发送
        </button>
      </div>
    </div>
  )
}

export default ChatRoom 