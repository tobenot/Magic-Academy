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
  const [error, setError] = useState<string | null>(null);

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
          // 假设后端返回数据结构中 avatarCustomization 包含 appearance 字段
          setAppearance(data.data.avatarCustomization.appearance);
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
  const handleSave = async (newAppearance: AvatarAppearance) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/avatar/${userId}`, {
        method: "PUT", // 可根据实际情况使用 PUT 或 PATCH 方法
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          avatarCustomization: {
            appearance: newAppearance,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("保存成功");
        // 保存成功后关闭编辑面板
        onClose();
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
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return appearance ? (
    <AvatarEditor
      initialAppearance={appearance}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  ) : (
    <div>无可编辑的外观数据</div>
  );
};

export default AvatarEditorContainer;
