// 注册表单提交处理
document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

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

const API_BASE_URL = 'https://magic-academy-backend.vercel.app';

// 登录表单提交处理
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

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
            document.getElementById('auth-container').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('登录失败，请重试');
    }
});
