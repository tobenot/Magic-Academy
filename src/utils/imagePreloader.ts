import AssetLoader, { AssetType, ImageType } from "./AssetLoader";

// 添加更多立绘ID
const CARD_LIST = [
  "default",
  "init (1)",
  "init (2)",
  "init (3)",
  "init (4)",
  "init (5)",
];

export const preloadCardImages = async (): Promise<void> => {
  const assetLoader = AssetLoader.getInstance();

  try {
    // 如果是本地开发环境,尝试动态导入整个文件夹
    if (!assetLoader.isItchEnvironment()) {
      const cardImages = import.meta.glob("/public/assets/images/cards/*.png");
      await Promise.all(
        Object.keys(cardImages).map(async (path) => {
          const img = new Image();
          img.src = path.replace("/public", "");
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // 即使加载失败也继续
          });
        }),
      );
    } else {
      // 在 itch.io 环境下,只预加载已知的卡片
      await Promise.all(
        CARD_LIST.map((cardId) => {
          const img = new Image();
          img.src = assetLoader.getAssetPath(
            AssetType.IMAGE,
            `${ImageType.CHARACTER}/cards/card_${cardId}.png`,
          );
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );
    }
    console.log("立绘预加载完成");
  } catch (error) {
    console.warn("立绘预加载失败:", error);
  }
};
