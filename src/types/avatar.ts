/**
 * 定义玩家自定义外观各部分的描述（存储 avatarMapping 中的 id，例如 "app_high_tall"）
 */
export interface CustomizableComponent {
  id: string;
  color: string;
}

/**
 * 定义玩家自定义外观各部分的描述（支持直接保存 avatarMapping 中的 id，
 * 或者对象形式 { id: string, color?: string } 用于附加颜色信息）
 */
export interface AvatarAppearance {
    // 基础属性（必选）
    bodyType: string | CustomizableComponent;    // 体型："standard"标准, "athletic"健硕, "slim"瘦削
    height: string | CustomizableComponent;      // 身高："tall"高, "medium"中等, "short"矮
    gender: string | CustomizableComponent;      // 性别："male"男, "female"女, "other"其他
    
    // 头部特征（必选）
    hairDescription: string | CustomizableComponent;   // 发型："short"短发, "long"长发, "bald"光头
    skinColor: string | CustomizableComponent;    // 肤色："light"浅色, "medium"中等, "dark"深色
    
    // 可选特征
    eyeColor?: string | CustomizableComponent;   // 眼睛颜色（作为次要特征）

    // 可扩展其他描述项
    [key: string]: any;
}

/**
 * 衣服系统，分为上身（包含打底、外套以及配饰）和下身层
 */
export interface AvatarClothing {
    upperBaseLayer: string | CustomizableComponent;   // 例如 "clothing_base_whiteT"（基础白T）
    upperOuterLayer?: string | CustomizableComponent;  // 例如 "clothing_outer_blue"（蓝色牛仔外套）
    lowerBody?: string | CustomizableComponent;     // 下身层，例如裤子或裙子
    accessory?: string | CustomizableComponent;   // 例如 "clothing_accessory_scarf"（红色围巾）
    // 根据需求后续可增加更多层次
}

/**
 * 装备系统，描述玩家在各个部位装备的物品（存储对应的 avatarMapping id）
 */
export interface AvatarEquipment {
    head?: string;      // 例如 "equip_head_hat"（黑色帽子）
    body?: string;      // 例如 "equip_body_armor"（钢铁护甲）
    arms?: string;      // 可扩展，如 "equip_arms_bracer"（护腕，对应 id）
    legs?: string;      // 可扩展，如 "equip_legs_guard"（护膝，对应 id）
    feet?: string;      // 可扩展，如 "equip_feet_boots"（战靴，对应 id）
    accessory?: string; // 可扩展，例如 "equip_accessory_ring"（戒指，对应 id）
}

/**
 * 动态层，结合游戏中世界动态机制变化的信息（存储 avatarMapping 中的 id），例如情绪、伤痕、阵营等
 */
export interface AvatarDynamicLayer {
    mood?: string;      // 情绪："neutral"中性, "happy"开心, "sad"悲伤
    lighting?: string;  // 光照效果："day"日光, "night"夜晚, "indoor"室内
    faction?: string;      // 例如 "faction_shadow"（暗影联盟）
}

/**
 * 综合玩家个性化定制内容
 */
export interface AvatarCustomization {
    appearance: AvatarAppearance;
    clothing?: AvatarClothing;
    equipment?: AvatarEquipment;
    dynamicLayer?: AvatarDynamicLayer;
    tags?: string[]; // 例如 ["tag_cool", "tag_smart"] 用于描述个性标签（存储 avatarMapping 中的 id）
}