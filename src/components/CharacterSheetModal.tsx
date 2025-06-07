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
    str: { name: '力量', icon: '💪', color: 'text-red-400' },
    dex: { name: '敏捷', icon: '🏃', color: 'text-green-400' },
    con: { name: '体质', icon: '🛡️', color: 'text-blue-400' },
    int: { name: '智力', icon: '🧠', color: 'text-purple-400' },
    wis: { name: '感知', icon: '👁️', color: 'text-yellow-400' },
    cha: { name: '魅力', icon: '✨', color: 'text-pink-400' }
  };

  const renderAbility = (key: keyof typeof character.abilities) => {
    const ability = abilityLabels[key];
    const value = character.abilities[key];
    const modifier = Math.floor((value - 10) / 2);
    
    return (
      <div className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center space-y-2">
          <div className={`text-2xl ${ability.color} group-hover:scale-110 transition-transform duration-200`}>
            {ability.icon}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className={`text-xs font-medium ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {modifier >= 0 ? '+' : ''}{modifier}
            </div>
            <div className="text-xs text-white/70 font-medium">{ability.name}</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-white/10 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          <div className="relative flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {character.nickname}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                  {character.staticProperties.role}
                </span>
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-medium">
                  {character.staticProperties.mbti}
                </span>
                <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full font-medium">
                  {character.staticProperties.archetype}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="group w-10 h-10 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <span className="text-xl text-white/70 group-hover:text-red-400">×</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Abilities Grid */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary flex items-center space-x-2">
              <span>⚡</span>
              <span>核心能力</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.keys(abilityLabels).map(key => renderAbility(key as keyof typeof character.abilities))}
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Proficiencies & Inventory */}
            <div className="space-y-6">
              {/* Proficiencies */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>熟练项</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {character.proficiencies.map((prof, index) => (
                    <span 
                      key={prof} 
                      className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold px-3 py-2 rounded-full border border-green-500/30 hover:scale-105 transition-transform duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {prof}
                    </span>
                  ))}
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-yellow-400 mb-4 flex items-center space-x-2">
                  <span>🎒</span>
                  <span>物品栏</span>
                </h4>
                <div className="bg-black/30 rounded-xl p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {character.dynamicProperties.inventory.length > 0 ? (
                    <div className="space-y-2">
                      {character.dynamicProperties.inventory.map((item: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors duration-200">
                          <span className="text-white/90">{item.name || '未知物品'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2">
                      <span className="text-3xl">📦</span>
                      <p className="text-sm">空空如也...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Character Properties */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl font-bold text-blue-400 mb-6 flex items-center space-x-2">
                <span>👤</span>
                <span>角色特质</span>
              </h4>
              <div className="space-y-4 text-sm">
                {[
                  { label: '性格', value: character.staticProperties.personality, icon: '🎭' },
                  { label: '特征', value: character.staticProperties.traits, icon: '⭐' },
                  { label: '当前心情', value: character.dynamicProperties.current_mood, icon: '😊' },
                  { label: '外貌', value: character.dynamicProperties.appearance, icon: '👀' },
                  { label: '言谈风格', value: character.staticProperties.speech_style, icon: '💬' },
                  { label: '目标', value: character.staticProperties.goals, icon: '🎯' }
                ].map((prop, index) => (
                  <div key={prop.label} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{prop.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white/90 mb-1">{prop.label}</div>
                        <div className="text-white/70 leading-relaxed">{prop.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Context Log */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center space-x-2">
                <span>📜</span>
                <span>情境日志</span>
              </h4>
              <div className="bg-black/30 rounded-xl p-4 h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {[...character.contextLog].reverse().map((log, index) => {
                    const cleanLog = log.startsWith('[') ? log.substring(log.indexOf(']') + 2) : log;
                    return (
                      <div 
                        key={index} 
                        className="bg-white/5 rounded-lg p-3 border-l-2 border-purple-400/30 hover:bg-white/10 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <p className="text-white/80 text-xs leading-relaxed">{cleanLog}</p>
                      </div>
                    );
                  })}
                  {character.contextLog.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2">
                      <span className="text-3xl">📝</span>
                      <p className="text-sm">暂无记录</p>
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