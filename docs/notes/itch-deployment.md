# Itch.io 部署指南

## 准备工作

1. 确保已安装所需依赖：

```bash
npm install
```

2. 检查版本号配置（`src/assets/config/version.json`）：

```json
{
  "version": "0.0.1"
}
```

## 构建步骤

1. 运行构建命令：

```bash
npm run build:itch
```

该命令会：

- 自动更新版本号
- 构建项目文件
- 创建发布包（ZIP文件）
- 输出文件位于 `dist` 目录

2. 检查构建输出：

- 确认 `dist` 目录下生成了最新的构建文件
- 检查生成的 ZIP 文件（格式：`magic-academy-v{version}.zip`）

## 上传到 Itch.io

1. 登录 [itch.io](https://itch.io)

2. 创建新项目：

   - 点击 "Upload New Project"
   - 选择项目类型为 "HTML"

3. 基本设置：

   - 项目名称：万象魔法学院
   - 项目简介：（填写项目描述）
   - 定价：Free

4. 上传构建文件：

   - 上传 `dist` 目录下的 ZIP 文件
   - 选择 "This file will be played in the browser"
   - 设置游戏窗口尺寸：800x600
   - 勾选 "Mobile friendly"

5. 嵌入设置：
   - 选择 "Enable fullscreen"
   - 设置背景色：#000000
   - SharedArrayBuffer 支持：根据需要开启

## 版本更新

1. 每次更新时：

   - 构建命令会自动增加版本号
   - 生成新的 ZIP 文件
   - 可在 itch.io 项目页面上传新版本

2. 版本号规则：
   - 格式：`x.y.z`
   - x: 主版本号（重大更新）
   - y: 次版本号（功能更新）
   - z: 修订号（自动递增）

## 注意事项

1. 构建前检查：

   - 所有资源文件是否存在
   - 环境变量是否正确
   - API 地址是否配置正确

2. 发布前测试：

   - 本地预览构建版本
   - 检查所有功能是否正常
   - 测试移动端适配

3. 文件大小优化：
   - 压缩图片资源
   - 移除未使用的依赖
   - 确保构建输出最小化

## 常见问题

1. 如果构建失败：

   - 检查 npm 依赖是否完整
   - 确认 Node.js 版本兼容
   - 查看构建日志定位错误

2. 如果游戏无法加载：

   - 检查资源路径是否正确
   - 确认 itch.io 设置是否正确
   - 测试浏览器兼容性

3. 版本号问题：
   - 手动修改 `version.json`
   - 重新运行构建命令
   - 确保版本号格式正确

## 相关命令

```bash
# 开发环境
npm run dev

# 构建并打包
npm run build:itch

# 预览构建版本
npm run preview
```

## 有用链接

- [Itch.io 开发者文档](https://itch.io/docs/creators)
- [HTML5 游戏最佳实践](https://itch.io/docs/creators/html5)
- [项目仓库](https://github.com/yourusername/magic-academy)

## 更新日志

请在每次发布新版本时更新此文档，记录重要变更。

### v0.0.1 (2024-01-29)

- 初始版本
- 基本登录功能
- 聊天室系统
