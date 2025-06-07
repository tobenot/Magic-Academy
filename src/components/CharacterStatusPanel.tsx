import React from 'react';

// Assuming a Character type will be defined elsewhere and passed as a prop
// For now, we'll define a partial one here for prop definition.
interface Character {
  nickname: string;
  dynamicProperties: {
    hp: number;
    maxHp: number;
    stamina: string; // Stamina can be a string like "5 + 1d4"
    maxStamina: number;
    satiation: number;
    maxSatiation: number;
    hydration: number;
    maxHydration: number;
  };
}

interface CharacterStatusPanelProps {
  character: Character | null;
  onShowSheet: () => void;
}

const CharacterStatusPanel: React.FC<CharacterStatusPanelProps> = ({ character, onShowSheet }) => {
  if (!character) {
    return (
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-32 space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/70 text-sm font-medium">正在加载角色信息...</span>
        </div>
      </div>
    );
  }

  const {
    hp,
    maxHp,
    stamina,
    maxStamina,
    satiation,
    maxSatiation,
    hydration,
    maxHydration,
  } = character.dynamicProperties;

  const StatBar: React.FC<{ value: number; maxValue: number; label: string; color: string; icon: string; gradient: string }> = ({ 
    value, maxValue, label, color, icon, gradient 
  }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const isLow = percentage < 30;
    const isCritical = percentage < 15;
    
    return (
      <div className="relative group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${color}`}>{icon}</span>
            <span className="text-white/90 font-medium text-sm">{label}</span>
          </div>
          <div className={`text-xs font-bold ${isCritical ? 'text-red-400 animate-pulse' : isLow ? 'text-yellow-400' : 'text-white/80'}`}>
            {value} / {maxValue}
          </div>
        </div>
        <div className="relative h-3 bg-black/40 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full ${gradient} ${isCritical ? 'animate-pulse' : ''}`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress opacity-60"></div>
          </div>
          {percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
          )}
        </div>
        {isCritical && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:shadow-primary/5 transition-all duration-300">
      {/* Header */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur opacity-50"></div>
        <div className="relative bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 text-center border border-primary/20">
          <h3 className="text-primary font-bold text-lg tracking-wide">
            {character.nickname}
          </h3>
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="space-y-4 mb-6">
        <StatBar 
          value={hp} 
          maxValue={maxHp} 
          label="生命值" 
          color="text-red-400"
          icon="❤️"
          gradient="bg-gradient-to-r from-red-600 to-red-500"
        />
        <StatBar 
          value={parseInt(stamina, 10) || 0} 
          maxValue={maxStamina} 
          label="体力值" 
          color="text-green-400"
          icon="⚡"
          gradient="bg-gradient-to-r from-green-600 to-green-500"
        />
        <StatBar 
          value={satiation} 
          maxValue={maxSatiation} 
          label="饱食度" 
          color="text-yellow-400"
          icon="🍖"
          gradient="bg-gradient-to-r from-yellow-600 to-yellow-500"
        />
        <StatBar 
          value={hydration} 
          maxValue={maxHydration} 
          label="水分值" 
          color="text-blue-400"
          icon="💧"
          gradient="bg-gradient-to-r from-blue-600 to-blue-500"
        />
      </div>

      {/* Character Sheet Button */}
      <button
        onClick={onShowSheet}
        className="group relative w-full p-4 bg-gradient-to-r from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary text-black rounded-xl transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-center space-x-2">
          <span>📋</span>
          <span>查看角色卡</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

export default CharacterStatusPanel; 