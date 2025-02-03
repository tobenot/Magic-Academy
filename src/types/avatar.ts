/**
 * 定义玩家自定义外观各部分的描述（存储 avatarMapping 中的 id，例如 "app_high_tall"）
 */
export interface AvatarAppearance {
  // 外观基本描述（均为 avatarMapping 中的 id）
  height: string; // 例如 "app_high_tall"（高挑）或其他对应 id
  bodyType: string; // 例如 "app_strong"（健硕）
  skinColor: string; // 例如 "app_skin_bronze"（古铜色）

  // 性别字段，使用 avatarMapping 中的 id，如 "gender_male", "gender_female", "gender_nonbinary", "gender_other"
  gender?: string;

  // 面部特征描述（均为 avatarMapping 中的 id）
  eyeColor: string; // 例如 "eye_blue"（蓝色）
  heterochromia?: string; // 例如 "het_red_blue"（红蓝异瞳）
  hairDescription: string; // 例如 "hair_long_curly"（长卷发）
  facialFeatures: string; // 例如 "face_sharp"（尖下巴）

  // 可扩展其他描述项
  [key: string]: any;
}

/**
 * 衣服系统，分为打底、外套以及配饰（存储对应的 avatarMapping id）
 */
export interface AvatarClothing {
  baseLayer: string; // 例如 "clothing_base_whiteT"（基础白T）
  outerLayer?: string; // 例如 "clothing_outer_blue"（蓝色牛仔外套）
  accessory?: string; // 例如 "clothing_accessory_scarf"（红色围巾）
  // 根据需求后续可增加更多层次
}

/**
 * 装备系统，描述玩家在各个部位装备的物品（存储对应的 avatarMapping id）
 */
export interface AvatarEquipment {
  head?: string; // 例如 "equip_head_hat"（黑色帽子）
  body?: string; // 例如 "equip_body_armor"（钢铁护甲）
  arms?: string; // 可扩展，如 "equip_arms_bracer"（护腕，对应 id）
  legs?: string; // 可扩展，如 "equip_legs_guard"（护膝，对应 id）
  feet?: string; // 可扩展，如 "equip_feet_boots"（战靴，对应 id）
  accessory?: string; // 可扩展，例如 "equip_accessory_ring"（戒指，对应 id）
}

/**
 * 动态层，结合游戏中世界动态机制变化的信息（存储 avatarMapping 中的 id），例如情绪、伤痕、阵营等
 */
export interface AvatarDynamicLayer {
  mood?: string; // 例如 "mood_angry"（愤怒）
  scars?: string; // 伤痕描述，可存储对应 id（若有）
  faction?: string; // 例如 "faction_shadow"（暗影联盟）
  // 可扩展其他动态属性
  [key: string]: any;
}

/**
 * 综合玩家个性化定制内容
 */
export interface AvatarCustomization {
  appearance: AvatarAppearance;
  clothing?: AvatarClothing;
  equipment?: AvatarEquipment;
  dynamicLayer?: AvatarDynamicLayer; // 动态层，支持情绪、伤痕、阵营等变化（存储为 id）
  tags?: string[]; // 例如 ["tag_cool", "tag_smart"] 用于描述个性标签（存储 avatarMapping 中的 id）
}
