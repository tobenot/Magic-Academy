type Listener = (...args: any[]) => void;

export class EventEmitter {
  protected events: { [key: string]: Set<Listener> } = {}; // 使用 Set 来存储监听器

  on(event: string, listener: Listener): void {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    this.events[event].add(listener);
    console.log(
      `[EventEmitter] 添加监听器 ${event}, 当前监听器数量:`,
      this.events[event].size,
    );
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      console.log(
        `[EventEmitter] 触发事件 ${event}, 监听器数量:`,
        this.events[event].size,
      );
      this.events[event].forEach((listener) => listener(...args));
    }
  }

  off(event: string, listener: Listener): void {
    if (this.events[event]) {
      const beforeSize = this.events[event].size;
      this.events[event].delete(listener);
      console.log(
        `[EventEmitter] 移除监听器 ${event}, 监听器数量: ${beforeSize} -> ${this.events[event].size}`,
      );
      if (this.events[event].size === 0) {
        delete this.events[event];
      }
    }
  }

  removeAllListeners(): void {
    console.log("[EventEmitter] 移除所有监听器");
    this.events = {};
  }
}
