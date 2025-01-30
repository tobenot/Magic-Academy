class AssetLoader {
  private static instance: AssetLoader;
  private readonly isItch: boolean;
  private readonly baseUrl: string;

  private constructor() {
    this.isItch = import.meta.env.VITE_DEPLOY_TARGET === "itch";
    this.baseUrl = this.isItch ? "." : "";
  }

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * 获取资源路径
   * @param path 相对于 assets 目录的路径
   * @returns 完整的资源路径
   */
  public getAssetPath(path: string): string {
    // 确保路径以 assets 开头
    const assetPath = path.startsWith("assets/") ? path : `assets/${path}`;
    return `${this.baseUrl}/${assetPath}`;
  }

  /**
   * 获取图片资源路径
   * @param name 图片名称（不含路径）
   * @returns 完整的图片路径
   */
  public getImagePath(name: string): string {
    return this.getAssetPath(`images/${name}`);
  }

  /**
   * 获取音频资源路径
   * @param name 音频文件名称（不含路径）
   * @returns 完整的音频路径
   */
  public getAudioPath(name: string): string {
    return this.getAssetPath(`audio/${name}`);
  }

  /**
   * 获取配置文件路径
   * @param name 配置文件名称（不含路径）
   * @returns 完整的配置文件路径
   */
  public getConfigPath(name: string): string {
    return this.getAssetPath(`config/${name}`);
  }

  /**
   * 检查当前是否是 itch.io 环境
   * @returns boolean
   */
  public isItchEnvironment(): boolean {
    return this.isItch;
  }
}

export default AssetLoader;
