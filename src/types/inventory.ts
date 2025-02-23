export interface InventoryItemDto {
    id: string;           // 唯一标识符
    name: string;         // 名称
    type: string;         // 物品类型，例如 'food', 'weapon' 等
    description: string;  // 物品描述
    weight: number;       // 物品重量
    attributes: Record<string, any>;  // 属性表，用于存放其他自定义属性
    interactions: Array<{
        action: string; // 交互类型，例如 'eat', 'equip' 等
        effect: Record<string, number>; // 交互效果，例如 { satiety: 20 } 表示食用后饱食度增加 20
    }>;  // 交互列表及其交互属性
} 