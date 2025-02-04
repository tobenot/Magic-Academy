import React, { useState, useEffect } from "react";
import AvatarEditor, { AvatarAppearance } from "./AvatarEditor";

// 新增：定义组件属性，包含 onClose 回调，用于关闭编辑面板
interface AvatarEditorContainerProps {
  onClose: () => void;
}

// 容器组件用于获取用户外观数据并处理编辑后的保存逻辑
const AvatarEditorContainer: React.FC<AvatarEditorContainerProps> = ({
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [appearance, setAppearance] = useState<AvatarAppearance | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  // 更新如下，改为从 localStorage 获取玩家自己的 userId
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) {
    return <div>请先登录</div>;
  }
  const userId = storedUserId;

  useEffect(() => {
    // 封装获取立绘定制数据的逻辑
    const fetchAvatarData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        // 可以根据具体情况选择调用： /api/v1/user/profile/{userId} 或 /api/v1/avatar/{userId}
        const response = await fetch(`${apiUrl}/avatar/${userId}`);
        const data = await response.json();
        if (data.success) {
          // 保存 avatarCustomization 和 imageUrl，由于 imageUrl 为单独字段，所以单独保存
          setAppearance(data.data.avatarCustomization);
          setSavedImageUrl(data.data.imageUrl);
        } else {
          throw new Error(data.message || "获取立绘数据失败");
        }
      } catch (err: any) {
        console.error("获取立绘数据出错:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarData();
  }, [userId]);

  // 编辑器保存回调，保存修改后的外观数据到后端
  const handleSave = async (
    newAppearance: AvatarAppearance,
  ): Promise<string> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/avatar/${userId}`, {
        method: "PUT", // 使用 PUT 方法更新数据
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          avatarCustomization: newAppearance,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("保存成功，返回的 imageUrl:", result.imageUrl);
        // 返回图片 URL，用于更新镜子区域
        return result.imageUrl;
      } else {
        throw new Error(result.message || "保存失败");
      }
    } catch (err: any) {
      console.error("保存出错:", err);
      throw err; // 可选择在外部捕获并处理错误
    }
  };

  // 取消编辑操作处理函数
  const handleCancel = () => {
    console.log("取消编辑");
    onClose();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl backdrop-blur-sm min-w-[350px] flex flex-col items-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
          <div className="mt-4 text-white text-lg font-medium">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return appearance ? (
    <AvatarEditor
      initialAppearance={appearance}
      initialImageUrl={savedImageUrl ?? undefined}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  ) : (
    <div>无可编辑的外观数据</div>
  );
};

export default AvatarEditorContainer;
