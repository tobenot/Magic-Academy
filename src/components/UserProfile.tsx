import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types/profile";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";
import AssetLoader, { AssetType, ImageType } from "../utils/AssetLoader";
import WebSocketService from "../services/WebSocketService";

interface UserProfileCardProps {
  userId: number;
  onClose: () => void;
}

// 添加动作分类枚举
enum ActionCategory {
  FRIENDLY = "FRIENDLY",
  ROMANTIC = "ROMANTIC",
  FUNNY = "FUNNY",
  MEAN = "MEAN",
  PERSONAL = "PERSONAL",
  ACTIVITY = "ACTIVITY",
}

// 修改动作接口定义
interface InteractionAction {
  id: string;
  name: string;
  needsTarget: boolean;
  duration?: number;
}

// 修改动作分类类型
type ActionsByCategory = {
  [key in ActionCategory]?: InteractionAction[];
};

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const profileCache: Record<number, { data: UserProfile; timestamp: number }> =
  {};

// 修改分类图标映射的定义方式
const categoryIcons: Record<ActionCategory, string> = {
  FRIENDLY: "👋",
  ROMANTIC: "💝",
  FUNNY: "😄",
  MEAN: "😈",
  PERSONAL: "🎭",
  ACTIVITY: "🎮",
};

// 添加分类显示名称映射
const categoryNames: Record<ActionCategory, string> = {
  FRIENDLY: "友好",
  ROMANTIC: "浪漫",
  FUNNY: "搞笑",
  MEAN: "刻薄",
  PERSONAL: "个人",
  ACTIVITY: "活动",
};

// 提取关闭按钮组件
const CloseButton = ({ onClose }: { onClose: () => void }): JSX.Element => (
  <button
    onClick={onClose}
    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
  >
    <span className="text-white/80 hover:text-white">×</span>
  </button>
);

const UserProfileCard = ({
  userId,
  onClose,
}: UserProfileCardProps): JSX.Element | null => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [actions, setActions] = useState<ActionsByCategory>({});
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ActionCategory | null>(null);
  const [loadingActions, setLoadingActions] = useState(false);

  const assetLoader = AssetLoader.getInstance();
  const getCardImagePath = (cardId: string): string => {
    return assetLoader.getAssetPath(
      AssetType.IMAGE,
      `${ImageType.CHARACTER}/cards/card_${cardId}.png`,
    );
  };

  const fetchProfile = useCallback(async () => {
    try {
      // 检查缓存
      const cached = profileCache[userId];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProfile(cached.data);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("获取用户资料失败");
      }

      const data = await response.json();

      // 更新缓存
      profileCache[userId] = {
        data: data.data,
        timestamp: Date.now(),
      };

      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
        // 直接使用后端返回的分类数据
        setActions(data);
      } else {
        console.error("动作列表数据格式错误");
        setActions({});
      }
    } catch (err) {
      console.error("获取动作列表失败:", err);
      setActions({});
    } finally {
      setLoadingActions(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchActions();
  }, [fetchProfile, fetchActions]);

  const wsService = WebSocketService.getInstance();

  // 修改动作处理函数
  const handleActionClick = useCallback(
    async (action: InteractionAction) => {
      if (!wsService) return;

      try {
        // 如果动作需要目标但没有目标ID，则不执行
        if (action.needsTarget && !userId) {
          console.warn("该动作需要目标用户");
          return;
        }

        // 发送交互请求
        await wsService.sendInteraction(
          action.id,
          action.needsTarget ? userId : undefined,
        );

        // 关闭动作菜单
        setShowActionMenu(false);
        setSelectedCategory(null);
        onClose();
      } catch (err) {
        console.error("执行动作失败:", err);
        // 这里可以添加错误提示
      }
    },
    [userId, wsService, onClose],
  );

  // 在选择分类时获取动作列表
  const handleCategorySelect = useCallback(
    (category: ActionCategory) => {
      setSelectedCategory(category);
      if (!actions[category]) {
        fetchActions();
      }
    },
    [actions, fetchActions],
  );

  // 修改 categories 的获取方式
  const categories = Object.values(ActionCategory);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/10 p-8 rounded-xl shadow-2xl min-w-[200px]">
          <CloseButton onClose={onClose} />
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/10 p-8 rounded-xl shadow-2xl min-w-[300px]">
          <CloseButton onClose={onClose} />
          <div className="flex items-center space-x-3 text-red-400 font-noto-serif">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/10 p-8 rounded-xl shadow-2xl min-w-[200px]">
          <CloseButton onClose={onClose} />
          <div className="text-white">未找到用户资料</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-b from-white/10 to-white/5 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transform transition-all">
        <CloseButton onClose={onClose} />

        {/* 立绘容器 */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          <img
            src={getCardImagePath(profile.cardImage)}
            alt="身份牌立绘"
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = getCardImagePath("default");
              setImageLoaded(true);
            }}
          />
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* 用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="space-y-4">
            {/* 用户名和状态 */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-cinzel font-bold text-primary">
                  {profile.nickname}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.status === "online"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : profile.status === "away"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}
              >
                {profile.status === "online"
                  ? "在线"
                  : profile.status === "away"
                    ? "离开"
                    : "离线"}
              </span>
            </div>

            {/* 称号 */}
            {profile.title && (
              <div className="text-sm text-primary/80 font-cinzel">
                {profile.title}
              </div>
            )}

            {/* 加入时间 */}
            <div className="text-sm text-gray-400 font-noto-serif">
              加入时间:{" "}
              {formatDistance(profile.joinDate, new Date(), { locale: zhCN })}前
            </div>

            {/* 个人简介 */}
            {profile.bio && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 font-noto-serif">
                {profile.bio}
              </div>
            )}

            {/* 统计信息 */}
            {profile.statistics && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-gray-400">发言数</div>
                  <div className="text-xl font-cinzel text-primary mt-1">
                    {profile.statistics.messageCount || 0}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-gray-400">在线时长</div>
                  <div className="text-xl font-cinzel text-primary mt-1">
                    {Math.floor((profile.statistics.totalOnlineTime || 0) / 60)}
                    <span className="text-sm ml-1">小时</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 添加交互按钮 */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={() => setShowActionMenu(true)}
            className="px-4 py-2 bg-primary hover:bg-secondary text-black rounded-full transition"
          >
            互动
          </button>
        </div>

        {/* 交互动作菜单 */}
        {showActionMenu && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
            <div className="relative bg-white/10 p-8 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-cinzel text-primary mb-6 text-center">
                选择互动类型
              </h3>

              {/* 使用网格布局替代轮盘式布局 */}
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
                        ${
                          isSelected
                            ? "bg-primary text-black scale-105 shadow-lg"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }
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

              {/* 动作列表 */}
              {selectedCategory && (
                <div className="space-y-2 max-h-48 overflow-y-auto bg-black/20 rounded-lg p-4 animate-fade-in">
                  <h4 className="text-lg font-cinzel text-primary mb-3 flex items-center">
                    <span className="mr-2">
                      {categoryIcons[selectedCategory]}
                    </span>
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
                        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg 
                          text-left transition group flex items-center justify-between"
                        disabled={action.needsTarget && !userId}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white">{action.name}</span>
                          {action.needsTarget && (
                            <span className="text-xs text-gray-400">
                              (需要目标)
                            </span>
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

              {/* 关闭按钮 */}
              <button
                onClick={() => {
                  setShowActionMenu(false);
                  setSelectedCategory(null);
                }}
                className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 
                  rounded-lg text-white transition"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-xs text-gray-200 opacity-60 pointer-events-none">
          ID: {profile.id}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
