import { useState, useEffect, useCallback } from "react";
import AvatarEditorContainer from "./AvatarEditorContainer";
import { UserProfile } from "../types/profile";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";
import AssetLoader, { AssetType, ImageType } from "../utils/AssetLoader";
import InteractionMenu from "./InteractionMenu";

interface UserProfileCardProps {
  userId: number;
  onClose: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const profileCache: Record<number, { data: UserProfile; timestamp: number }> =
  {};

// 修改 CloseButton 组件样式
const CloseButton = ({ onClose }: { onClose: () => void }): JSX.Element => (
  <button
    onClick={onClose}
    className="absolute top-[-5vh] right-0 z-10 w-[4vh] h-[4vh] rounded-full 
               bg-white/10 hover:bg-white/20 backdrop-blur-sm
               flex items-center justify-center transition-all duration-200
               border border-white/20 hover:border-white/40
               group"
  >
    <svg 
      className="w-[2.5vh] h-[2.5vh] text-white/60 group-hover:text-white/90 transition-colors" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
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
  const [showInteractionMenu, setShowInteractionMenu] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const currentUserId = Number(localStorage.getItem("userId") || "0");
  const isOwnProfile = currentUserId === userId;

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

  const fetchAvatarImage = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/avatar/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("获取角色立绘失败");
      }

      const data = await response.json();
      if (data.success) {
        setAvatarUrl(data.data.imageUrl);
      }
    } catch (err) {
      console.error("获取角色立绘失败:", err);
    } finally {
      setAvatarLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
    fetchAvatarImage();
  }, [fetchProfile, fetchAvatarImage]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/10 p-8 rounded-xl shadow-2xl min-w-[200px]">
          <CloseButton onClose={onClose} />
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
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
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
        <div className="relative bg-white/10 p-8 rounded-xl shadow-2xl min-w-[200px]">
          <CloseButton onClose={onClose} />
          <div className="text-white">未找到用户资料</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div className="relative w-[95%] max-w-[1200px] mx-auto flex gap-[3%] items-center justify-center">
        <CloseButton onClose={onClose} />

        <div className="flex flex-col items-center">
          <div className="text-[2vh] text-white/80 font-cinzel mb-[1vh]">
            角色外观
          </div>
          
          <div className="relative h-[70vh] aspect-[2/3] flex-none bg-gradient-to-b from-white/10 to-white/5 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
            {avatarLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="角色立绘"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = assetLoader.getAssetPath(
                    AssetType.IMAGE,
                    `${ImageType.CHARACTER}/default_avatar.png`
                  );
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                暂无立绘
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[2vh] text-white/80 font-cinzel mb-[1vh]">
            身份牌
          </div>

          <div className="relative h-[70vh] aspect-[2/3] flex-none bg-gradient-to-b from-white/10 to-white/5 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="relative w-full h-full">
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-[5%] text-white">
                <div className="space-y-[2%]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[2.5vh] font-cinzel font-bold text-primary">
                      {profile.nickname}
                    </h3>
                    <span
                      className={`px-[1vh] py-[0.5vh] rounded-full text-[1.5vh] font-medium ${
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

                  {profile.title && (
                    <div className="text-[1.8vh] text-primary/80 font-cinzel">
                      {profile.title}
                    </div>
                  )}

                  <div className="text-[1.6vh] text-gray-400 font-noto-serif">
                    加入时间: {formatDistance(profile.joinDate, new Date(), { locale: zhCN })}前
                  </div>

                  {profile.bio && (
                    <div className="mt-[2%] p-[3%] bg-white/5 rounded-lg border border-white/10 font-noto-serif text-[1.6vh]">
                      {profile.bio}
                    </div>
                  )}

                  {profile.statistics && (
                    <div className="grid grid-cols-2 gap-[3%] mt-[2%]">
                      <div className="bg-white/5 p-[3%] rounded-lg border border-white/10">
                        <div className="text-[1.4vh] text-gray-400">发言数</div>
                        <div className="text-[1.8vh] font-cinzel text-primary">
                          {profile.statistics.messageCount || 0}
                        </div>
                      </div>
                      <div className="bg-white/5 p-[3%] rounded-lg border border-white/10">
                        <div className="text-[1.4vh] text-gray-400">在线时长</div>
                        <div className="text-[1.8vh] font-cinzel text-primary">
                          {Math.floor((profile.statistics.totalOnlineTime || 0) / 60)}
                          <span className="text-[1.4vh] ml-1">小时</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮组 - 从左下角开始排列 */}
        <div className="absolute bottom-[-8vh] left-0 flex gap-[2vh]">
          {isOwnProfile && (
            <button
              onClick={() => setShowAvatarEditor(true)}
              className="px-[3vh] py-[1.5vh] bg-primary hover:bg-secondary text-black rounded-full transition text-[1.8vh]"
            >
              修改外观
            </button>
          )}
          <button
            onClick={() => setShowInteractionMenu(true)}
            className="px-[3vh] py-[1.5vh] bg-primary hover:bg-secondary text-black rounded-full transition text-[1.8vh]"
          >
            互动
          </button>
        </div>
      </div>

      {showInteractionMenu && (
        <InteractionMenu
          userId={userId}
          onClose={() => setShowInteractionMenu(false)}
          onActionSuccess={() => {
            setShowInteractionMenu(false);
            onClose();
          }}
        />
      )}

      {showAvatarEditor && (
        <AvatarEditorContainer onClose={() => setShowAvatarEditor(false)} />
      )}
    </div>
  );
};

export default UserProfileCard;
