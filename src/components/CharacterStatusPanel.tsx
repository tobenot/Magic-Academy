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
      <div className="bg-mud-panel border-2 border-mud-border p-4">
        <div className="flex flex-col items-center justify-center h-32 space-y-2">
          <div className="text-primary animate-blink">[ LOADING 加载中 ]</div>
          <span className="text-mud-muted text-sm font-mono">正在加载角色信息...</span>
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

  const StatBar: React.FC<{ 
    value: number; 
    maxValue: number; 
    label: string; 
    color: string;
    bgColor: string;
  }> = ({ value, maxValue, label, color, bgColor }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const isLow = percentage < 30;
    const isCritical = percentage < 15;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-mono ${color}`}>{label}</span>
          <span className={`text-xs font-mono ${isCritical ? 'text-mud-danger animate-blink' : isLow ? 'text-mud-warning' : 'text-mud-text'}`}>
            {value}/{maxValue}
          </span>
        </div>
        <div className={`h-4 ${bgColor} border border-mud-border relative`}>
          <div 
            className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-300 origin-left transform`}
            style={{ width: `${percentage}%` }}
          >
            {isCritical && (
              <div className="absolute inset-0 bg-mud-danger animate-blink opacity-50"></div>
            )}
          </div>
          {percentage > 0 && (
            <div className="absolute right-1 top-0 h-full flex items-center">
              <span className="text-xs font-mono text-black font-bold">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-mud-panel border-2 border-mud-border p-4 font-mono">
      {/* Header */}
      <div className="border-b border-mud-border pb-3 mb-4">
        <div className="text-center">
          <div className="text-primary text-lg font-bold mb-1">
            [ {character.nickname.toUpperCase()} ]
          </div>
          <div className="text-xs text-mud-success">*** ONLINE 在线 ***</div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="space-y-1">
        <StatBar 
          value={hp} 
          maxValue={maxHp} 
          label="HP 生命" 
          color="text-status-hp"
          bgColor="bg-mud-bg"
        />
        <StatBar 
          value={parseInt(stamina, 10) || 0} 
          maxValue={maxStamina} 
          label="ST 体力" 
          color="text-status-stamina"
          bgColor="bg-mud-bg"
        />
        <StatBar 
          value={satiation} 
          maxValue={maxSatiation} 
          label="FD 饱食" 
          color="text-status-hunger"
          bgColor="bg-mud-bg"
        />
        <StatBar 
          value={hydration} 
          maxValue={maxHydration} 
          label="H2O 水分" 
          color="text-status-thirst"
          bgColor="bg-mud-bg"
        />
      </div>

      {/* Character Sheet Button */}
      <div className="mt-4 pt-3 border-t border-mud-border">
        <button
          onClick={onShowSheet}
          className="w-full bg-mud-bg border-2 border-primary text-primary hover:bg-primary hover:text-mud-bg font-mono font-bold py-2 px-4 transition-colors duration-200"
        >
          [ CHARACTER SHEET 角色卡 ]
        </button>
      </div>
    </div>
  );
};

export default CharacterStatusPanel; 