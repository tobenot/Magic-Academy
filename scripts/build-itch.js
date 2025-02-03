import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import archiver from "archiver";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION_FILE = path.join(__dirname, "../src/assets/config/version.json");

// 添加资源处理函数
async function copyAssets() {
  const publicDir = path.join(__dirname, "../public");
  const distDir = path.join(__dirname, "../dist");
  const assetsDir = path.join(distDir, "assets");

  try {
    // 确保目标目录存在
    await fs.mkdir(assetsDir, { recursive: true });

    // 复制资源文件
    await fs.cp(path.join(publicDir, "assets"), assetsDir, {
      recursive: true,
      force: true,
    });

    console.log("资源文件复制完成");
  } catch (error) {
    console.error("复制资源文件失败:", error);
    throw error;
  }
}

async function updateVersion() {
  let version = { version: "0.0.0" };

  try {
    const versionData = await fs.readFile(VERSION_FILE, "utf-8");
    version = JSON.parse(versionData);
  } catch (error) {
    // 如果文件不存在，使用默认版本
    await fs.mkdir(path.dirname(VERSION_FILE), { recursive: true });
  }

  // 增加版本号
  const parts = version.version.split(".");
  parts[2] = (parseInt(parts[2]) + 1).toString();
  version.version = parts.join(".");

  // 保存新版本号
  await fs.writeFile(VERSION_FILE, JSON.stringify(version, null, 2));

  return version.version;
}

function createZip(version) {
  return new Promise((resolve, reject) => {
    const zipName = `magic-academy-v${version}.zip`;
    const zipPath = path.join(__dirname, "../dist", zipName);
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`ZIP 文件已创建: ${zipName} (${archive.pointer()} bytes)`);
      resolve(zipName);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // 修改点：使用 glob 方法归档，并在 ignore 中排除刚生成的 ZIP 文件
    const sourceDir = path.join(__dirname, "../dist");
    archive.glob("**/*", {
      cwd: sourceDir,
      ignore: [zipName],
    });

    archive.finalize();
  });
}

async function buildForItch() {
  try {
    // 更新版本号
    const version = await updateVersion();
    console.log(`构建版本 ${version}...`);

    // 设置环境变量
    process.env.VITE_DEPLOY_TARGET = "itch";
    process.env.VITE_VERSION = version;
    process.env.NODE_ENV = "production";
    process.env.PUBLIC_URL = "./";

    console.log("环境变量:");
    console.log("VITE_DEPLOY_TARGET:", process.env.VITE_DEPLOY_TARGET);
    console.log("VITE_VERSION:", process.env.VITE_VERSION);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("PUBLIC_URL:", process.env.PUBLIC_URL);

    // 清理 dist 目录
    try {
      await fs.rm(path.join(__dirname, "../dist"), { recursive: true });
    } catch (error) {
      // 忽略目录不存在的错误
    }

    // 构建项目
    console.log("构建项目...");
    await execAsync("npm run build", {
      env: { ...process.env },
    });

    console.log("复制资源文件...");
    await copyAssets();

    // 创建 ZIP 文件
    console.log("创建 ZIP 压缩包...");
    const zipName = await createZip(version);

    console.log("构建完成！");
    console.log(`发布包已创建: dist/${zipName}`);
  } catch (error) {
    console.error("构建失败:", error);
    process.exit(1);
  }
}

buildForItch();
