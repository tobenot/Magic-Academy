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

        {/* 版本号显示 */}
        <div className="mt-4 text-xs text-gray-400">版本 v{version}</div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        type={modalState.type}
        actions={<ModalButton onClick={hideModal}>确定</ModalButton>}
      >
        <p>{modalState.message}</p>
      </Modal>
    </>
  );
};

export default AuthForm;
