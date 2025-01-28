import 'phaser';

interface ChatMessage {
    username: string;
    content: string;
    timestamp: number;
}

class ChatRoom {
    private chatContainer: HTMLDivElement;
    private messageInput: HTMLInputElement;
    private messages: ChatMessage[] = [];

    constructor() {
        this.initializeUI();
    }

    private initializeUI(): void {
        const gameContainer = document.getElementById('game-container') as HTMLDivElement;
        gameContainer.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="输入消息..." />
                    <button>发送</button>
                </div>
            </div>
        `;

        this.chatContainer = gameContainer.querySelector('.chat-messages') as HTMLDivElement;
        this.messageInput = gameContainer.querySelector('input') as HTMLInputElement;
        const sendButton = gameContainer.querySelector('button') as HTMLButtonElement;

        // 绑定事件
        sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    private sendMessage(): void {
        const content = this.messageInput.value.trim();
        if (!content) return;

        const message: ChatMessage = {
            username: 'User', // 后续可以从登录信息获取
            content,
            timestamp: Date.now()
        };

        this.addMessage(message);
        this.messageInput.value = '';
    }

    private addMessage(message: ChatMessage): void {
        this.messages.push(message);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <span class="username">${message.username}</span>
            <span class="content">${message.content}</span>
            <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        `;

        this.chatContainer.appendChild(messageElement);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

// 导出启动聊天室的函数，供登录成功后调用
window.startGame = () => {
    new ChatRoom();
}; 