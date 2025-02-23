// 定义交互动作的效果类型
export interface InteractionEffect {
    type: 'item' | 'status' | 'need';  // 效果类型：获得物品、状态改变、需求值改变等
    duration?: number;                 // 交互持续时间（毫秒）
    items?: Array<{                    // 如果是物品类型，定义可获得的物品
        itemId: string;                // 物品配置中的ID
        probability: number;           // 获得概率（0-1）
        minQuantity: number;          // 最小数量
        maxQuantity: number;          // 最大数量
    }>;
    needs?: Record<string, number>;    // 需求值变化
    status?: Record<string, any>;      // 状态变化
}

// 交互物配置类型
export interface InteractableConfig {
    id: string;
    name: string;
    description: string;
    interactions: Record<string, InteractionEffect>;
}

// 交互物配置
export const interactablesConfig: Record<string, InteractableConfig> = {
    apple_tree: {
        id: "apple_tree",
        name: "苹果树",
        description: "一棵结满鲜红苹果的树，果实看起来非常诱人。",
        interactions: {
            collect: {
                type: 'item',
                duration: 5000, // 采集需要5秒
                items: [{
                    itemId: 'apple',
                    probability: 0.8, // 80%概率获得
                    minQuantity: 1,
                    maxQuantity: 3
                }]
            }
        }
    },
    ancient_rock: {
        id: "ancient_rock",
        name: "古老巨石",
        description: "一块古老的巨石，充满岁月的痕迹。",
        interactions: {
            push: {
                type: 'status',
                duration: 3000,
                status: { strength: 1 }
            },
            examine: {
                type: 'status',
                duration: 2000,
                status: { knowledge: 1 }
            }
        }
    },
    water_plant: {
        id: "water_plant",
        name: "水草",
        description: "大片茂密的水草，隐约可见小鱼穿梭其间。",
        interactions: {
            collect: {
                type: 'item',
                duration: 3000,
                items: [{
                    itemId: 'water_grass',
                    probability: 1, // 100%获得
                    minQuantity: 2,
                    maxQuantity: 5
                }]
            }
        }
    },
    torch: {
        id: "torch",
        name: "火把",
        description: "一根燃烧的火把，照亮前路。",
        interactions: {
            pick: {
                type: 'item',
                duration: 1000,
                items: [{
                    itemId: 'torch',
                    probability: 1,
                    minQuantity: 1,
                    maxQuantity: 1
                }]
            }
        }
    },
    totem: {
        id: "totem",
        name: "图腾",
        description: "神秘的图腾，似乎记录着部落的历史。",
        interactions: {
            worship: {
                type: 'need',
                duration: 5000,
                needs: {
                    spirit: 10,
                    peace: 5
                }
            },
            study: {
                type: 'status',
                duration: 10000,
                status: {
                    knowledge: 2,
                    culture: 1
                }
            }
        }
    }
}; 