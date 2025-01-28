// 通过检查当前URL来判断是否为本地开发环境
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const API_BASE_URL = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace(/['"]/g, '') : '';
console.log('Initial API_BASE_URL:', API_BASE_URL);
console.log('Type of API_BASE_URL:', typeof API_BASE_URL);

// 获取表单和按钮元素
const authForm = document.getElementById('auth-form');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');

// 注册按钮点击事件处理
registerButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const requestUrl = API_BASE_URL + '/register';
    console.log('构建的请求URL:', requestUrl);
    console.log('URL组成部分:', {
        base: API_BASE_URL,
        endpoint: '/register',
        final: requestUrl
    });

    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // 如果需要发送cookie
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error:', error);
        alert('注册失败，请重试');
    }
});

// 登录按钮点击事件处理
loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(API_BASE_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // 如果需要发送cookie
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        alert(data.message);

        if (data.message === '登录成功') {
            // 隐藏身份验证容器和主菜单图像
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('main-menu').style.display = 'none';
            // 显示游戏容器
            document.getElementById('game-container').style.display = 'block';

            // 初始化和启动 Phaser 游戏
            if (typeof window.startGame === 'function') {
                window.startGame();
            } else {
                console.error('startGame 函数未定义');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('登录失败，请重试');
    }
});