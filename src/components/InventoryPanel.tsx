import { useState, useEffect, useCallback } from 'react';
import { InventoryItemDto } from '../types/inventory';

// 物品类型图标映射
const typeIcons: Record<string, string> = {
  food: '🍖',
  weapon: '⚔️',
  armor: '🛡️',
  potion: '🧪',
  scroll: '📜',
  material: '💎',
  misc: '📦'
};

interface InventoryPanelProps {
  onClose: () => void;
}

// 新增：堆叠物品接口
interface StackedItem extends InventoryItemDto {
  quantity: number;
  instances: InventoryItemDto[];
}

const InventoryPanel = ({ onClose }: InventoryPanelProps): JSX.Element => {
  const [items, setItems] = useState<InventoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StackedItem | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [totalWeight, setTotalWeight] = useState(0);

  // 获取物品栏数据
  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('获取物品栏失败');
      }

      const result = await response.json();
      if (result.success) {
        setItems(result.data);
        // 计算总重量
        const weight = result.data.reduce((acc: number, item: InventoryItemDto) => acc + item.weight, 0);
        setTotalWeight(weight);
      }
    } catch (error) {
      console.error('获取物品栏失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // 处理物品交互
  const handleItemInteraction = async (item: StackedItem, action: string) => {
    try {
      // 根据交互类型执行不同操作
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ item: item.instances[0] }) // 使用堆叠中的第一个物品实例
      });

      if (!response.ok) {
        throw new Error('物品交互失败');
      }

      // 刷新物品栏
      fetchInventory();
    } catch (error) {
      console.error('物品交互失败:', error);
    }
  };

  // 获取可用的物品类型列表
  const itemTypes = ['all', ...new Set(items.map(item => item.type))];

  // 堆叠相同ID的物品
  const stackItems = (items: InventoryItemDto[]): StackedItem[] => {
    const stacks = new Map<string, StackedItem>();
    
    items.forEach(item => {
      if (stacks.has(item.id)) {
        const stack = stacks.get(item.id)!;
        stack.quantity += 1;
        stack.instances.push(item);
      } else {
        stacks.set(item.id, {
          ...item,
          quantity: 1,
          instances: [item]
        });
      }
    });

    return Array.from(stacks.values());
  };

  // 过滤并堆叠物品列表
  const filteredItems = stackItems(
    filter === 'all' 
      ? items 
      : items.filter(item => item.type === filter)
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white/10 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-cinzel text-primary">物品栏</h2>
          <div className="flex items-center gap-4">
            <span className="text-white">
              总重量: {totalWeight.toFixed(1)} kg
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-primary transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 物品类型过滤器 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {itemTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === type 
                  ? 'bg-primary text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {type === 'all' ? '全部' : (
                <span className="flex items-center gap-2">
                  {typeIcons[type] || '📦'}
                  {type}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* 物品网格 */}
          <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-4 p-4 bg-black/20 rounded-lg">
            {loading ? (
              <div className="col-span-4 flex justify-center items-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`
                    relative p-4 rounded-lg cursor-pointer transition
                    ${selectedItem?.id === item.id 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">
                    {typeIcons[item.type] || '📦'}
                  </div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-sm text-gray-400">
                    重量: {(item.weight * item.quantity).toFixed(1)} kg
                  </div>
                  {item.quantity > 1 && (
                    <div className="absolute top-2 right-2 bg-primary/80 text-black px-2 py-1 rounded-full text-xs font-bold">
                      ×{item.quantity}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-400 py-8">
                没有找到物品
              </div>
            )}
          </div>

          {/* 物品详情面板 */}
          {selectedItem && (
            <div className="w-72 bg-black/20 p-4 rounded-lg overflow-y-auto">
              <h3 className="text-xl font-cinzel text-primary mb-4 flex items-center justify-between">
                <span>{selectedItem.name}</span>
                {selectedItem.quantity > 1 && (
                  <span className="text-sm bg-primary/80 text-black px-2 py-1 rounded-full">
                    ×{selectedItem.quantity}
                  </span>
                )}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-400 mb-1">类型</div>
                  <div className="text-white flex items-center gap-2">
                    {typeIcons[selectedItem.type] || '📦'}
                    {selectedItem.type}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">描述</div>
                  <div className="text-white">{selectedItem.description}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">属性</div>
                  <div className="space-y-1">
                    {Object.entries(selectedItem.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-white">
                        <span>{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">可用操作</div>
                  <div className="space-y-2">
                    {selectedItem.interactions.map(({ action, effect }) => (
                      <button
                        key={action}
                        onClick={() => handleItemInteraction(selectedItem, action)}
                        className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center justify-between"
                      >
                        <span>{action}</span>
                        <span className="text-xs text-gray-400">
                          {Object.entries(effect)
                            .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
                            .join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel; 