/**
 * 资源类型枚举
 */
export enum AssetType {
  IMAGE = "images",
  AUDIO = "audio",
  CONFIG = "config",
  DATA = "data",
  MODEL = "models",
  SPRITE = "sprites",
}

/**
 * 图片类型枚举
 */
export enum ImageType {
  SCENE = "scenes",
  UI = "ui",
  CHARACTER = "characters",
  ITEM = "items",
}

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
   * @param type 资源类型
   * @param path 资源路径
   * @returns 完整的资源路径
   */
  public getAssetPath(type: AssetType, path: string): string {
    return `${this.baseUrl}/assets/${type}/${path}`;
  }

  /**
   * 获取图片资源路径
   * @param path 图片路径
   * @returns 完整的图片路径
   */
  public getImagePath(path: string): string {
    return this.getAssetPath(AssetType.IMAGE, path);
  }

  /**
   * 获取场景图片路径
   * @param filename 场景图片文件名
   * @returns 完整的场景图片路径
   */
  public getSceneImagePath(filename: string): string {
    return this.getImagePath(`${ImageType.SCENE}/${filename}`);
  }

  /**
   * 获取UI图片路径
   * @param filename UI图片文件名
   * @returns 完整的UI图片路径
   */
  public getUIImagePath(filename: string): string {
    return this.getImagePath(`${ImageType.UI}/${filename}`);
  }

  /**
   * 获取角色图片路径
   * @param filename 角色图片文件名
   * @returns 完整的角色图片路径
   */
  public getCharacterImagePath(filename: string): string {
    return this.getImagePath(`${ImageType.CHARACTER}/${filename}`);
  }

  /**
   * 获取音频资源路径
   * @param path 音频路径
   * @returns 完整的音频路径
   */
  public getAudioPath(path: string): string {
    return this.getAssetPath(AssetType.AUDIO, path);
  }

  /**
   * 获取配置文件路径
   * @param path 配置文件路径
   * @returns 完整的配置文件路径
   */
  public getConfigPath(path: string): string {
    return this.getAssetPath(AssetType.CONFIG, path);
  }

  /**
   * 检查当前是否是 itch.io 环境
   */
  public isItchEnvironment(): boolean {
    return this.isItch;
  }
}

export default AssetLoader;
