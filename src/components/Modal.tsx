import { ReactNode, useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  type?: "info" | "success" | "warning" | "error";
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  type = "info",
}: ModalProps): JSX.Element | null => {
  // 控制整个模态框的显示/隐藏
  const [show, setShow] = useState(false);
  // 控制动画状态
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 先显示元素
      setShow(true);
      // 在下一帧开始动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
    } else {
      // 先关闭动画
      setAnimate(false);
      // 等待动画结束后隐藏元素
      const timer = setTimeout(() => {
        setShow(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  // 根据类型设置不同的样式
  const typeStyles = {
    info: "border-blue-500",
    success: "border-green-500",
    warning: "border-yellow-500",
    error: "border-red-500",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          animate ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div
        className={`relative bg-black/90 border-2 ${
          typeStyles[type]
        } rounded-lg shadow-lg max-w-md w-full mx-4 transition-all duration-200 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* 标题栏 */}
        {title && (
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-cinzel text-primary">{title}</h3>
          </div>
        )}

        {/* 内容区 */}
        <div className="px-6 py-4 text-white">{children}</div>

        {/* 操作按钮区 */}
        {actions && (
          <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// 预设的按钮组件
export const ModalButton = ({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
}) => {
  const variantStyles = {
    primary: "bg-primary hover:bg-secondary text-black",
    secondary: "bg-white/10 hover:bg-white/20 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded transition-colors ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Modal;
