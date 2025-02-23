export interface Item {
    id: string;
    name: string;
    type: string;
    description: string;
    weight: number;
    attributes: Record<string, any>;
    interactions: Array<{
        action: string;
        effect: Record<string, number>;
    }>;
} 