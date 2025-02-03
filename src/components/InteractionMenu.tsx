import { useState, useEffect, useCallback } from "react";
import WebSocketService from "../services/WebSocketService";

// 定义动作分类枚举
enum ActionCategory {
  FRIENDLY = "FRIENDLY",
  ROMANTIC = "ROMANTIC",
  FUNNY = "FUNNY",
  MEAN = "MEAN",
  PERSONAL = "PERSONAL",
  ACTIVITY = "ACTIVITY",
}

// 定义动作接口
interface InteractionAction {
  id: string;
  name: string;
  category: ActionCategory;
  message: string;
  endMessage?: string;
  needsTarget: boolean;
  needsEndMessage?: boolean;
  duration?: number | null;
  persistent: boolean;
  initiatorId: number;
  targetId: number;
}

// 分类动作映射类型
type ActionsByCategory = {
  [key in ActionCategory]?: InteractionAction[];
};

// 分类图标映射
const categoryIcons: Record<ActionCategory, string> = {
  FRIENDLY: "👋",
  ROMANTIC: "💝",
  FUNNY: "😄",
  MEAN: "😈",
  PERSONAL: "🎭",
  ACTIVITY: "🎮",
};

// 分类显示名称映射
const categoryNames: Record<ActionCategory, string> = {
  FRIENDLY: "友好",
  ROMANTIC: "浪漫",
  FUNNY: "搞笑",
  MEAN: "刻薄",
  PERSONAL: "个人",
  ACTIVITY: "活动",
};

interface InteractionMenuProps {
  userId: number;
  onClose: () => void;
  onActionSuccess?: () => void;
}

const InteractionMenu = ({
  userId,
  onClose,
  onActionSuccess,
}: InteractionMenuProps): JSX.Element => {
  const [actions, setActions] = useState<ActionsByCategory>({});
  const [selectedCategory, setSelectedCategory] =
    useState<ActionCategory | null>(null);
  const [loadingActions, setLoadingActions] = useState(false);
  const [currentActions, setCurrentActions] = useState<InteractionAction[]>([]);

  const wsService = WebSocketService.getInstance();

  const fetchActions = useCallback(async () => {
    try {
      setLoadingActions(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/interaction/actions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("获取动作列表失败");
      }

      const { success, data } = await response.json();

      if (success && data) {
        if (Array.isArray(data)) {
          // 按分类分组
          const groupedActions: ActionsByCategory = {};
          data.forEach((action: InteractionAction) => {
            const category = action.category as ActionCategory;
            if (!groupedActions[category]) {
              groupedActions[category] = [];
            }
            groupedActions[category]?.push(action);
          });
          setActions(groupedActions);
        } else if (typeof data === "object") {
          setActions(data);
        } else {
          console.error("动作列表数据格式错误", data);
          setActions({});
        }
      } else {
        console.error("动作列表数据格式错误", data);
        setActions({});
      }
    } catch (err) {
      console.error("获取动作列表失败:", err);
      setActions({});
    } finally {
      setLoadingActions(false);
    }
  }, []);

  const fetchCurrentActions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/interaction/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("获取当前进行中的动作失败");
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setCurrentActions(result.data);
      } else {
        setCurrentActions([]);
      }
    } catch (err) {
      console.error("获取当前动作失败：", err);
      setCurrentActions([]);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    fetchCurrentActions();
  }, [fetchCurrentActions]);

  const handleActionClick = useCallback(
    async (action: InteractionAction) => {
      if (!wsService) return;
      try {
        if (action.needsTarget && !userId) {
          console.warn("该动作需要目标用户");
          return;
        }
        if (action.persistent) {
          // 持续动作：记录动作后关闭弹窗
          await wsService.sendInteraction(
            action.id,
            action.needsTarget ? userId : undefined,
          );
          setCurrentActions((prev) => [...prev, action]);
          if (onActionSuccess) {
            onActionSuccess();
          } else {
            onClose();
          }
        } else {
          // 非持续动作：直接关闭弹窗
          await wsService.sendInteraction(
            action.id,
            action.needsTarget ? userId : undefined,
          );
          if (onActionSuccess) {
            onActionSuccess();
          } else {
            onClose();
          }
        }
      } catch (err) {
        console.error("执行动作失败:", err);
      }
    },
    [userId, wsService, onClose, onActionSuccess],
  );

  const handleCancelSpecificAction = useCallback(
    async (action: InteractionAction) => {
      try {
        await wsService.cancelInteraction(action.id, action.targetId);
        setCurrentActions((prev) => prev.filter((a) => a.id !== action.id));
      } catch (err) {
        console.error("取消动作失败:", err);
      }
    },
    [wsService],
  );

  const handleCategorySelect = useCallback(
    (category: ActionCategory) => {
      setSelectedCategory(category);
      if (!actions[category]) {
        fetchActions();
      }
    },
    [actions, fetchActions],
  );

  const categories = Object.values(ActionCategory);

  const relevantActions = currentActions.filter(
    (action) => action.initiatorId === userId || action.targetId === userId,
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="relative bg-white/10 p-8 rounded-xl max-w-md w-full">
        <h3 className="text-xl font-cinzel text-primary mb-6 text-center">
          选择互动类型
        </h3>

        {relevantActions.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto bg-black/20 rounded-lg p-4 mb-6 animate-fade-in">
            <h4 className="text-lg font-cinzel text-primary mb-3">
              当前进行中的动作
            </h4>
            {relevantActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white">{action.name}</span>
                  {action.initiatorId === userId && (
                    <span className="text-xs text-gray-400">(我发起的)</span>
                  )}
                  {action.targetId === userId &&
                    action.initiatorId !== userId && (
                      <span className="text-xs text-gray-400">(对我的)</span>
                    )}
                </div>
                <button
                  onClick={() => handleCancelSpecificAction(action)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                >
                  取消
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`
                  p-4 rounded-xl transition-all duration-300
                  flex flex-col items-center justify-center gap-2
                  ${isSelected ? "bg-primary text-black scale-105 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}
                `}
              >
                <span
                  className="text-2xl"
                  role="img"
                  aria-label={categoryNames[category]}
                >
                  {categoryIcons[category]}
                </span>
                <span className="text-xs">{categoryNames[category]}</span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="space-y-2 max-h-48 overflow-y-auto bg-black/20 rounded-lg p-4 animate-fade-in">
            <h4 className="text-lg font-cinzel text-primary mb-3 flex items-center">
              <span className="mr-2">{categoryIcons[selectedCategory]}</span>
              {categoryNames[selectedCategory]}
            </h4>
            {loadingActions ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : actions[selectedCategory]?.length ? (
              actions[selectedCategory]?.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition group flex items-center justify-between"
                  disabled={action.needsTarget && !userId}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white">{action.name}</span>
                    {action.needsTarget && (
                      <span className="text-xs text-gray-400">(需要目标)</span>
                    )}
                    {action.persistent && (
                      <span className="text-xs text-blue-300">(持续)</span>
                    )}
                  </div>
                  {action.duration && (
                    <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                      {Math.floor(action.duration / 1000)}秒
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                该分类下暂无可用动作
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default InteractionMenu;
