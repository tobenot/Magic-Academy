import { InventoryItemDto } from '../types/inventory';

export const itemsConfig: Record<string, InventoryItemDto> = {
    apple: {
        id: 'apple',
        name: '苹果',
        type: 'food',
        description: '新鲜的红苹果，看起来很好吃',
        weight: 0.3,
        attributes: {
            freshness: 100
        },
        interactions: [{
            action: 'eat',
            effect: {
                satiety: 20,
                health: 5
            }
        }]
    },
    water_grass: {
        id: 'water_grass',
        name: '水草',
        type: 'material',
        description: '湿润的水草，可以用来编织',
        weight: 0.2,
        attributes: {},
        interactions: []
    },
    torch: {
        id: 'torch',
        name: '火把',
        type: 'tool',
        description: '明亮的火把，可以照明',
        weight: 1,
        attributes: {
            durability: 100
        },
        interactions: [{
            action: 'use',
            effect: {
                light: 1
            }
        }]
    },
    vine: {
        id: 'vine',
        name: '藤蔓',
        type: 'material',
        description: '之前缠在你身上的藤蔓，话说这是怎么来的？',
        weight: 0.5,
        attributes: {},
        interactions: []
    }
}; 