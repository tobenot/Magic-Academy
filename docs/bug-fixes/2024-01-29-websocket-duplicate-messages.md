# WebSocket 消息重复触发问题修复报告

## 问题描述

在聊天室组件中，每条 WebSocket 消息都会被触发两次，导致相同的消息在界面上显示两次。

## 问题原因

1. React 组件重新渲染时会重新创建事件处理函数
2. 每次重新创建的函数是新的引用，导致 EventEmitter 的 off() 方法无法正确移除旧的监听器
3. 由于旧监听器未被移除，同时又添加了新监听器，导致每个消息被处理两次

## 修复方案

1. 使用 React.useCallback 包装所有事件处理函数，确保函数引用在组件重渲染之间保持稳定
2. 将事件处理函数移到 useEffect 外部定义
3. 在 EventEmitter 类中使用 Set 代替数组来存储监听器，确保监听器不会重复

## 代码修改

1. ChatRoom.tsx:

   - 添加 useCallback 包装所有事件处理函数
   - 将事件处理函数定义移到 useEffect 外部
   - 添加正确的依赖数组到 useEffect

2. EventEmitter.ts:
   - 使用 Set 存储监听器而不是数组
   - 添加更完善的监听器管理机制

## 开发警示

1. React 组件中的函数每次渲染都会创建新的引用
2. 使用 EventEmitter 时需要特别注意监听器的生命周期管理
3. 在 useEffect 中注册事件监听器时，需要正确处理清理函数
4. 使用 useCallback/useMemo 来优化函数引用的稳定性

## 预防措施

1. 在使用事件系统时，始终使用 useCallback 包装事件处理函数
2. 添加详细的日志来跟踪事件的注册和触发过程
3. 在组件卸载时确保清理所有事件监听器
4. 考虑使用 Set 等数据结构来防止重复监听器

## 相关文件

- src/components/ChatRoom.tsx
- src/services/EventEmitter.ts
- src/services/WebSocketService.ts

## 验证方法

1. 发送消息，确认消息只显示一次
2. 检查控制台日志，确认事件只触发一次
3. 多次重新渲染组件，确认不会产生重复的监听器

## 后续建议

1. 考虑添加单元测试来验证事件系统的正确性
2. 实现监听器数量的监控机制
3. 在开发环境中添加重复监听器的警告
