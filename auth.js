import { config } from './main.js';

// 获取表单和按钮元素
const authForm = document.getElementById('auth-form');
const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');

const API_BASE_URL = 'https://magic-academy-backend.vercel.app';

// 注册按钮点击事件处理
registerButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
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
        const response = await fetch(`${API_BASE_URL}/login`, {
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
            const game = new Phaser.Game(config);
            game.scene.start('MainScene');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('登录失败，请重试');
    }
});