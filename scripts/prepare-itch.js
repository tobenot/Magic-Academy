import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function prepareItchPackage() {
  const distPath = path.join(__dirname, "../dist");
  const itchPath = path.join(__dirname, "../itch");

  try {
    // 创建 itch 目录
    await fs.mkdir(itchPath, { recursive: true });

    // 复制 dist 目录到 itch 目录
    await fs.cp(distPath, itchPath, { recursive: true });

    // 创建 itch.io 配置文件
    const itchConfig = {
      title: "万象魔法学院",
      width: 800,
      height: 600,
      fullscreen: false,
    };

    await fs.writeFile(
      path.join(itchPath, "itch.json"),
      JSON.stringify(itchConfig, null, 2),
    );

    console.log("Itch.io 包准备完成！");
    console.log("文件位于:", itchPath);
    console.log("现在你可以压缩 itch 目录并上传到 itch.io");
  } catch (error) {
    console.error("准备 Itch.io 包时出错:", error);
    process.exit(1);
  }
}

prepareItchPackage();
