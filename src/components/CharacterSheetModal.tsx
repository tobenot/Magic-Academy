import React from 'react';

// This Character interface should ideally be in a shared types file
// It's defined here to match the full structure of the API response
interface Character {
  id: number;
  nickname: string;
  staticProperties: {
    role: string;
    mbti: string;
    archetype: string;
    personality: string;
    traits: string;
    speech_style: string;
    goals: string;
  };
  dynamicProperties: {
    hp: number;
    maxHp: number;
    stamina: string;
    maxStamina: number;
    appearance: string;
    current_mood: string;
    inventory: any[]; // Define a proper type if inventory item structure is known
  };
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  proficiencies: string[];
  contextLog: string[];
}

interface CharacterSheetModalProps {
  character: Character | null;
  onClose: () => void;
}

const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  const abilityLabels = {
    str: { name: 'STR', desc: '力量' },
    dex: { name: 'DEX', desc: '敏捷' },
    con: { name: 'CON', desc: '体质' },
    int: { name: 'INT', desc: '智力' },
    wis: { name: 'WIS', desc: '感知' },
    cha: { name: 'CHA', desc: '魅力' }
  };

  const renderAbility = (key: keyof typeof character.abilities) => {
    const ability = abilityLabels[key];
    const value = character.abilities[key];
    const modifier = Math.floor((value - 10) / 2);
    
    return (
      <div className="bg-mud-bg border border-mud-border p-3 text-center">
        <div className="text-primary font-bold text-lg font-mono">{ability.name}</div>
        <div className="text-mud-text text-2xl font-mono font-bold">{value}</div>
        <div className={`text-xs font-mono ${modifier >= 0 ? 'text-mud-success' : 'text-mud-danger'}`}>
          {modifier >= 0 ? '+' : ''}{modifier}
        </div>
        <div className="text-xs text-mud-muted font-mono">{ability.desc}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-mud-panel border-2 border-primary text-mud-text w-full max-w-6xl max-h-[95vh] flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-primary p-4 bg-mud-bg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                ========== CHARACTER SHEET 角色卡 ==========
              </h2>
              <div className="mt-2 space-y-1">
                <div className="text-mud-text">NAME 姓名: <span className="text-secondary font-bold">{character.nickname.toUpperCase()}</span></div>
                <div className="flex space-x-4 text-sm">
                  <span>ROLE 职业: <span className="text-primary">{character.staticProperties.role}</span></span>
                  <span>TYPE 类型: <span className="text-primary">{character.staticProperties.mbti}</span></span>
                  <span>CLASS 分类: <span className="text-primary">{character.staticProperties.archetype}</span></span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="bg-mud-danger text-white border border-mud-danger hover:bg-white hover:text-mud-danger px-4 py-2 font-bold transition-colors"
            >
              [X] CLOSE 关闭
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Abilities */}
          <div>
            <h3 className="text-xl font-bold text-secondary mb-3 border-b border-mud-border pb-1">
              === CORE ABILITIES 核心能力 ===
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.keys(abilityLabels).map(key => renderAbility(key as keyof typeof character.abilities))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Proficiencies & Inventory */}
            <div className="space-y-4">
              {/* Proficiencies */}
              <div className="bg-mud-bg border border-mud-border p-4">
                <h4 className="text-lg font-bold text-accent mb-3 border-b border-mud-border pb-1">
                  === SKILLS 技能 ===
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {character.proficiencies.map((prof, index) => (
                    <div key={prof} className="text-sm">
                      <span className="text-mud-muted">{'>'}</span> <span className="text-mud-text">{prof}</span>
                    </div>
                  ))}
                  {character.proficiencies.length === 0 && (
                    <div className="text-mud-muted text-center py-4">[ NO SKILLS 无技能 ]</div>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-mud-bg border border-mud-border p-4">
                <h4 className="text-lg font-bold text-accent mb-3 border-b border-mud-border pb-1">
                  === INVENTORY 物品栏 ===
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {character.dynamicProperties.inventory.length > 0 ? (
                    <div className="space-y-1">
                      {character.dynamicProperties.inventory.map((item: any, index: number) => (
                        <div key={index} className="text-sm bg-mud-panel border border-mud-border p-2">
                          <span className="text-mud-muted">{'>'}</span> <span className="text-mud-text">{item.name || 'UNKNOWN ITEM 未知物品'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-mud-muted text-center py-6">
                      [ EMPTY 空 ]
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Character Properties */}
            <div className="bg-mud-bg border border-mud-border p-4">
              <h4 className="text-lg font-bold text-accent mb-3 border-b border-mud-border pb-1">
                === CHARACTER DATA 角色数据 ===
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'PERSONALITY 性格', value: character.staticProperties.personality },
                  { label: 'TRAITS 特征', value: character.staticProperties.traits },
                  { label: 'MOOD 心情', value: character.dynamicProperties.current_mood },
                  { label: 'APPEARANCE 外貌', value: character.dynamicProperties.appearance },
                  { label: 'SPEECH 言谈', value: character.staticProperties.speech_style },
                  { label: 'GOALS 目标', value: character.staticProperties.goals }
                ].map((prop) => (
                  <div key={prop.label} className="border-b border-mud-border pb-2">
                    <div className="text-secondary font-bold mb-1">{prop.label}:</div>
                    <div className="text-mud-text leading-relaxed pl-2">{prop.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Context Log */}
            <div className="bg-mud-bg border border-mud-border p-4">
              <h4 className="text-lg font-bold text-accent mb-3 border-b border-mud-border pb-1">
                === GAME LOG 游戏日志 ===
              </h4>
              <div className="h-96 overflow-y-auto bg-mud-panel border border-mud-border p-2">
                <div className="space-y-2">
                  {[...character.contextLog].reverse().map((log, index) => {
                    const cleanLog = log.startsWith('[') ? log.substring(log.indexOf(']') + 2) : log;
                    return (
                      <div key={index} className="text-xs">
                        <span className="text-mud-muted">{'>'}</span> <span className="text-mud-text">{cleanLog}</span>
                      </div>
                    );
                  })}
                  {character.contextLog.length === 0 && (
                    <div className="text-mud-muted text-center py-8">
                      [ NO RECORDS 无记录 ]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetModal; 