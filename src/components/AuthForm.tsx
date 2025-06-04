import { useState } from "react";
import { AuthService } from "../services/AuthService";
// 导入版本文件
import versionJson from "../assets/config/version.json";
import Modal, { ModalButton } from "./Modal";
import { useModal } from "../hooks/useModal";

interface AuthFormProps {
  onLoginSuccess: (userId: number) => void;
}

const AuthForm = ({ onLoginSuccess }: AuthFormProps): JSX.Element => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    nickname: "",
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // 添加状态控制提示文字显示
  const [showHints, setShowHints] = useState({
    username: false,
    password: false,
  });

  const { modalState, showModal, hideModal } = useModal();
  // 添加游戏介绍模态框状态
  const [showGameIntro, setShowGameIntro] = useState(false);

  // 直接使用导入的版本号
  const version = versionJson.version;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const authService = new AuthService();
      const requestCredentials =
        authMode === "login"
          ? { username: credentials.username, password: credentials.password }
          : { ...credentials };

      const response =
        authMode === "login"
          ? await authService.login(requestCredentials)
          : await authService.register(requestCredentials);

      if (authMode === "login") {
        if (response.message === "登录成功") {
          if (typeof response.id === "number") {
            showModal("成功", "登录成功！", "success");
            onLoginSuccess(response.id);
          } else {
            showModal("错误", "登录成功，但获取用户信息失败", "error");
          }
        } else {
          showModal("错误", response.message, "error");
        }
      } else if (authMode === "register") {
        // 注册成功后自动切换到登录模式
        showModal("成功", "注册成功，请登录", "success");
        setAuthMode("login");
        setCredentials((prev) => ({ ...prev, nickname: "" }));
      } else {
        showModal("成功", response.message, "success");
      }
    } catch (error) {
      showModal(
        "错误",
        error instanceof Error ? error.message : "未知错误",
        "error",
      );
    }
  };

  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-cinzel text-primary mb-4">
          Omnivista Magic Academy
        </h1>
        <h1 className="text-2xl font-noto-serif text-primary mb-8" lang="zh">
          万象魔法学院
        </h1>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          id="loginForm"
          method="post"
          autoComplete="on"
        >
          <div className="space-y-1">
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="用户名"
              className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              onFocus={() =>
                setShowHints((prev) => ({ ...prev, username: true }))
              }
              onBlur={() =>
                setShowHints((prev) => ({ ...prev, username: false }))
              }
            />
            {showHints.username && (
              <p className="text-xs text-gray-400 text-left animate-fade-in">
                3-20个字符，可使用字母、数字、下划线
              </p>
            )}
          </div>

          {authMode === "register" && (
            <div className="space-y-1">
              <input
                type="text"
                name="nickname"
                placeholder="昵称 (可选, 显示名，最大20字符)"
                className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
                value={credentials.nickname}
                maxLength={20}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    nickname: e.target.value,
                  }))
                }
              />
            </div>
          )}

          <div className="space-y-1">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="密码"
              className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              onFocus={() =>
                setShowHints((prev) => ({ ...prev, password: true }))
              }
              onBlur={() =>
                setShowHints((prev) => ({ ...prev, password: false }))
              }
            />
            {showHints.password && (
              <div className="space-y-0.5 animate-fade-in">
                <p className="text-xs text-gray-400 text-left">
                  6-20个字符，需包含字母和数字
                </p>
                <p className="text-xs text-gray-400 text-left">
                  密码不会明文储存，但建议新想一个记在备忘录里
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary hover:bg-secondary text-black rounded transition"
            >
              {authMode === "login" ? "登录" : "注册"}
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-400 text-center">
            {authMode === "login" ? "没有账号？" : "已有账号？"}
            <span
              className="cursor-pointer text-primary underline ml-1"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login" ? "注册" : "登录"}
            </span>
          </div>
        </form>

        {/* 添加游戏介绍按钮 */}
        <div className="mt-6 border-t border-white/20 pt-4">
          <button
            onClick={() => setShowGameIntro(true)}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-primary rounded border border-primary/30 hover:border-primary/60 transition-all duration-200 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2 font-noto-serif">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              什么是万象魔法学院？
            </span>
          </button>
        </div>

        {/* 版本号显示 */}
        <div className="mt-4 text-xs text-gray-400">版本 v{version}</div>
      </div>

      {/* 原有的模态框 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        type={modalState.type}
        actions={<ModalButton onClick={hideModal}>确定</ModalButton>}
      >
        <p>{modalState.message}</p>
      </Modal>

      {/* 游戏介绍模态框 */}
      <Modal
        isOpen={showGameIntro}
        onClose={() => setShowGameIntro(false)}
        title="万象魔法学院 - 设计理念"
        type="info"
        actions={<ModalButton onClick={() => setShowGameIntro(false)}>开始探索</ModalButton>}
      >
        <div className="space-y-4 text-left max-h-[60vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
            <h3 className="text-lg font-cinzel text-primary mb-2">🌟 核心理念</h3>
            <p className="text-gray-300 leading-relaxed font-noto-serif">
              万象魔法学院是一个由人工智能驱动的<strong className="text-primary">动态文本世界</strong>。
              这里没有预设的剧本，每一次冒险都是独一无二的。AI管理者们会根据你的行动实时响应，
              创造出前所未有的叙事体验。
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-cinzel text-primary">🎮 你能体验到什么？</h3>
            <div className="grid gap-3">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <h4 className="text-primary font-medium mb-1">自由探索</h4>
                <p className="text-sm text-gray-400 font-noto-serif">
                  在神秘的荧露树林中自由行走，每个区域都有独特的秘密等你发现
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <h4 className="text-primary font-medium mb-1">智能互动</h4>
                <p className="text-sm text-gray-400 font-noto-serif">
                  与16个AI智能体交流合作，每个都有独特的性格和能力
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <h4 className="text-primary font-medium mb-1">世界塑造</h4>
                <p className="text-sm text-gray-400 font-noto-serif">
                  你的每一个行动都会被世界记住，并影响后续的故事发展
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <h4 className="text-primary font-medium mb-1">角色成长</h4>
                <p className="text-sm text-gray-400 font-noto-serif">
                  通过探索和互动不断提升能力，解锁新的可能性
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-cinzel text-green-400 mb-2">🌱 当前版本：蛮荒时代</h3>
            <p className="text-gray-300 text-sm leading-relaxed font-noto-serif">
              世界刚刚诞生，荧露树林还是一片原始的蛮荒之地。
              作为首批探索者，你将见证这个世界从混沌走向文明的过程。
              每一次冒险都在书写历史的第一页。
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 font-noto-serif mt-4 pt-4 border-t border-white/10">
            这是一个不断进化的世界，你的故事将成为传说的一部分
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AuthForm;
