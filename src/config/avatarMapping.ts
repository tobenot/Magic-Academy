export interface AvatarMappingEntry {
  id: string;
  category: "appearance" | "clothing" | "equipment" | "dynamic" | "tag";
  description: string;
  enDescription: string;
  zhRemark: string;
}

export const AvatarMapping: Record<string, AvatarMappingEntry> = {
  // Appearance 映射（外观）
  app_high_tall: {
    id: "app_high_tall",
    category: "appearance",
    description: "高挑",
    enDescription: "tall",
    zhRemark: "高挑",
  },
  app_strong: {
    id: "app_strong",
    category: "appearance",
    description: "健硕",
    enDescription: "muscular",
    zhRemark: "健硕",
  },
  app_skin_bronze: {
    id: "app_skin_bronze",
    category: "appearance",
    description: "古铜色",
    enDescription: "bronze",
    zhRemark: "古铜色",
  },
  eye_blue: {
    id: "eye_blue",
    category: "appearance",
    description: "蓝色",
    enDescription: "blue",
    zhRemark: "蓝色",
  },
  het_red_blue: {
    id: "het_red_blue",
    category: "appearance",
    description: "红蓝异瞳",
    enDescription: "red-blue heterochromia",
    zhRemark: "红蓝异瞳",
  },
  hair_long_curly: {
    id: "hair_long_curly",
    category: "appearance",
    description: "长卷发",
    enDescription: "long curly hair",
    zhRemark: "长卷发",
  },
  face_sharp: {
    id: "face_sharp",
    category: "appearance",
    description: "尖下巴",
    enDescription: "pointed chin",
    zhRemark: "尖下巴",
  },

  // Gender 映射（性别选项）
  gender_male: {
    id: "gender_male",
    category: "appearance",
    description: "男性",
    enDescription: "Male",
    zhRemark: "男性",
  },
  gender_female: {
    id: "gender_female",
    category: "appearance",
    description: "女性",
    enDescription: "Female",
    zhRemark: "女性",
  },
  gender_nonbinary: {
    id: "gender_nonbinary",
    category: "appearance",
    description: "非二元",
    enDescription: "Non-binary",
    zhRemark: "非二元",
  },
  gender_other: {
    id: "gender_other",
    category: "appearance",
    description: "其他",
    enDescription: "Other",
    zhRemark: "其他",
  },

  // Clothing 映射（服饰）
  clothing_base_whiteT: {
    id: "clothing_base_whiteT",
    category: "clothing",
    description: "白色T恤",
    enDescription: "white T-shirt",
    zhRemark: "白色T恤",
  },
  clothing_outer_blue: {
    id: "clothing_outer_blue",
    category: "clothing",
    description: "蓝色牛仔外套",
    enDescription: "blue denim jacket",
    zhRemark: "蓝色牛仔外套",
  },
  clothing_accessory_scarf: {
    id: "clothing_accessory_scarf",
    category: "clothing",
    description: "红色围巾",
    enDescription: "red scarf",
    zhRemark: "红色围巾",
  },

  // Equipment 映射（装备）
  equip_head_hat: {
    id: "equip_head_hat",
    category: "equipment",
    description: "黑色帽子",
    enDescription: "black hat",
    zhRemark: "黑色帽子",
  },
  equip_body_armor: {
    id: "equip_body_armor",
    category: "equipment",
    description: "钢铁护甲",
    enDescription: "steel armor",
    zhRemark: "钢铁护甲",
  },

  // Dynamic 映射（动态层）
  mood_angry: {
    id: "mood_angry",
    category: "dynamic",
    description: "愤怒",
    enDescription: "angry",
    zhRemark: "愤怒",
  },
  scar_left_face: {
    id: "scar_left_face",
    category: "dynamic",
    description: "左脸一道刀疤",
    enDescription: "scar on left face",
    zhRemark: "左脸一道刀疤",
  },
  faction_shadow: {
    id: "faction_shadow",
    category: "dynamic",
    description: "暗影联盟",
    enDescription: "shadow alliance",
    zhRemark: "暗影联盟",
  },

  // Tag 映射（标签）
  tag_cool: {
    id: "tag_cool",
    category: "tag",
    description: "冷酷",
    enDescription: "cool",
    zhRemark: "冷酷",
  },
  tag_strong: {
    id: "tag_strong",
    category: "tag",
    description: "坚韧",
    enDescription: "tough",
    zhRemark: "坚韧",
  },
  tag_smart: {
    id: "tag_smart",
    category: "tag",
    description: "机敏",
    enDescription: "smart",
    zhRemark: "机敏",
  },
};
