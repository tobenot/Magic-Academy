import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "../types/profile";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";
import AssetLoader, { AssetType, ImageType } from "../utils/AssetLoader";

interface UserProfileCardProps {
  userId: number;
  onClose: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const profileCache: Record<number, { data: UserProfile; timestamp: number }> =
  {};

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
}: UserProfileCardProps): JSX.Element => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  if (!profile) return null;

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
              <h3 className="text-2xl font-cinzel font-bold text-primary">
                {profile.username}
              </h3>
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
      </div>
    </div>
  );
};

export default UserProfileCard;
