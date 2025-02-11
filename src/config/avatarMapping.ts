export interface AvatarMappingEntry {
  id: string;
  category: "appearance" | "clothing" | "equipment" | "dynamic" | "tag";
  displayname: string;
  enGenImage: string;
  zhGenImage: string;
  appliesTo: string | string[];
  allowColor?: boolean;
}

// ===== 外观映射（Appearance） =====
  // 基础外观选项
export const AvatarMapping: Record<string, AvatarMappingEntry> = {
"app_normal": {
  "id": "app_normal",
  "category": "appearance",
  "displayname": "普通",
  "enGenImage": "normal",
  "zhGenImage": "普通",
  "appliesTo": "bodyType"
},
"app_plump": {
  "id": "app_plump",
  "category": "appearance",
  "displayname": "丰满",
  "enGenImage": "plump",
  "zhGenImage": "丰满",
  "appliesTo": "bodyType"
},
"app_strong": {
  "id": "app_strong",
  "category": "appearance",
  "displayname": "健硕",
  "enGenImage": "muscular",
  "zhGenImage": "健硕",
  "appliesTo": "bodyType"
},
"app_thin": {
  "id": "app_thin",
  "category": "appearance",
  "displayname": "瘦弱",
  "enGenImage": "thin",
  "zhGenImage": "瘦弱",
  "appliesTo": "bodyType"
},
"eye_amber": {
  "id": "eye_amber",
  "category": "appearance",
  "displayname": "琥珀色",
  "enGenImage": "amber eyes",
  "zhGenImage": "琥珀眼睛",
  "appliesTo": "eyeColor"
},
"eye_black": {
  "id": "eye_black",
  "category": "appearance",
  "displayname": "黑色",
  "enGenImage": "black eyes",
  "zhGenImage": "黑色眼睛",
  "appliesTo": "eyeColor"
},
"eye_blue": {
  "id": "eye_blue",
  "category": "appearance",
  "displayname": "蓝色",
  "enGenImage": "blue eyes",
  "zhGenImage": "蓝色眼睛",
  "appliesTo": "eyeColor",
  "allowColor": true
},
"eye_brown": {
  "id": "eye_brown",
  "category": "appearance",
  "displayname": "棕色",
  "enGenImage": "brown eyes",
  "zhGenImage": "棕色眼睛",
  "appliesTo": "eyeColor"
},
"eye_gray": {
  "id": "eye_gray",
  "category": "appearance",
  "displayname": "灰色",
  "enGenImage": "gray eyes",
  "zhGenImage": "灰色眼睛",
  "appliesTo": "eyeColor"
},
"eye_green": {
  "id": "eye_green",
  "category": "appearance",
  "displayname": "绿色",
  "enGenImage": "green eyes",
  "zhGenImage": "绿色眼睛",
  "appliesTo": "eyeColor",
  "allowColor": true
},
"eye_hazel": {
  "id": "eye_hazel",
  "category": "appearance",
  "displayname": "榛子色",
  "enGenImage": "hazel eyes",
  "zhGenImage": "榛子眼睛",
  "appliesTo": "eyeColor"
},
"eye_orange": {
  "id": "eye_orange",
  "category": "appearance",
  "displayname": "橙色",
  "enGenImage": "orange eyes",
  "zhGenImage": "橙色眼睛",
  "appliesTo": "eyeColor"
},
"eye_pink": {
  "id": "eye_pink",
  "category": "appearance",
  "displayname": "粉色",
  "enGenImage": "pink eyes",
  "zhGenImage": "粉色眼睛",
  "appliesTo": "eyeColor"
},
"eye_purple": {
  "id": "eye_purple",
  "category": "appearance",
  "displayname": "紫色",
  "enGenImage": "purple eyes",
  "zhGenImage": "紫色眼睛",
  "appliesTo": "eyeColor"
},
"eye_red": {
  "id": "eye_red",
  "category": "appearance",
  "displayname": "红色",
  "enGenImage": "red eyes",
  "zhGenImage": "红色眼睛",
  "appliesTo": "eyeColor"
},
"eye_white": {
  "id": "eye_white",
  "category": "appearance",
  "displayname": "白色",
  "enGenImage": "white eyes",
  "zhGenImage": "白色眼睛",
  "appliesTo": "eyeColor"
},
"eye_yellow": {
  "id": "eye_yellow",
  "category": "appearance",
  "displayname": "黄色",
  "enGenImage": "yellow eyes",
  "zhGenImage": "黄色眼睛",
  "appliesTo": "eyeColor"
},
"het_red_blue": {
  "id": "het_red_blue",
  "category": "appearance",
  "displayname": "红蓝异瞳",
  "enGenImage": "red-blue heterochromia",
  "zhGenImage": "红蓝异瞳",
  "appliesTo": "eyeColor"
},
"face_oval": {
  "id": "face_oval",
  "category": "appearance",
  "displayname": "椭圆脸",
  "enGenImage": "oval face",
  "zhGenImage": "椭圆脸",
  "appliesTo": "facialFeatures"
},
"face_round": {
  "id": "face_round",
  "category": "appearance",
  "displayname": "圆脸",
  "enGenImage": "round face",
  "zhGenImage": "圆脸",
  "appliesTo": "facialFeatures"
},
"face_sharp": {
  "id": "face_sharp",
  "category": "appearance",
  "displayname": "尖下巴",
  "enGenImage": "pointed chin",
  "zhGenImage": "尖下巴",
  "appliesTo": "facialFeatures"
},
"face_square": {
  "id": "face_square",
  "category": "appearance",
  "displayname": "方脸",
  "enGenImage": "square face",
  "zhGenImage": "方脸",
  "appliesTo": "facialFeatures"
},
"gender_female": {
  "id": "gender_female",
  "category": "appearance",
  "displayname": "女性",
  "enGenImage": "Female",
  "zhGenImage": "女性",
  "appliesTo": "gender"
},
"hair_long_curly": {
  "id": "hair_long_curly",
  "category": "appearance",
  "displayname": "长卷发",
  "enGenImage": "long curly hair",
  "zhGenImage": "长卷发",
  "appliesTo": "hairDescription"
},
"hair_long_straight": {
  "id": "hair_long_straight",
  "category": "appearance",
  "displayname": "长直发",
  "enGenImage": "long straight hair",
  "zhGenImage": "长直发",
  "appliesTo": "hairDescription",
  "allowColor": true
},
"hair_long_wavy": {
  "id": "hair_long_wavy",
  "category": "appearance",
  "displayname": "长波浪发",
  "enGenImage": "long wavy hair",
  "zhGenImage": "长波浪发",
  "appliesTo": "hairDescription",
  "allowColor": true
},
"hair_short_curly": {
  "id": "hair_short_curly",
  "category": "appearance",
  "displayname": "短卷发",
  "enGenImage": "short curly hair",
  "zhGenImage": "短卷发",
  "appliesTo": "hairDescription",
  "allowColor": true
},
"hair_short_straight": {
  "id": "hair_short_straight",
  "category": "appearance",
  "displayname": "短直发",
  "enGenImage": "short straight hair",
  "zhGenImage": "短直发",
  "appliesTo": "hairDescription",
  "allowColor": true
},
"app_high_tall": {
  "id": "app_high_tall",
  "category": "appearance",
  "displayname": "高挑",
  "enGenImage": "tall",
  "zhGenImage": "高挑",
  "appliesTo": "height"
},
"app_medium": {
  "id": "app_medium",
  "category": "appearance",
  "displayname": "中等身高",
  "enGenImage": "medium height",
  "zhGenImage": "中等身高",
  "appliesTo": "height"
},
"app_short": {
  "id": "app_short",
  "category": "appearance",
  "displayname": "小巧",
  "enGenImage": "short",
  "zhGenImage": "矮小",
  "appliesTo": "height"
},
"app_skin_bronze": {
  "id": "app_skin_bronze",
  "category": "appearance",
  "displayname": "古铜色",
  "enGenImage": "bronze skin",
  "zhGenImage": "古铜色",
  "appliesTo": "skinColor"
},
"app_skin_dark_brown": {
  "id": "app_skin_dark_brown",
  "category": "appearance",
  "displayname": "深棕肤色",
  "enGenImage": "dark brown skin",
  "zhGenImage": "深棕肤色",
  "appliesTo": "skinColor"
},
"app_skin_fair": {
  "id": "app_skin_fair",
  "category": "appearance",
  "displayname": "白皙",
  "enGenImage": "fair skin",
  "zhGenImage": "白皙",
  "appliesTo": "skinColor"
},
"app_skin_olive": {
  "id": "app_skin_olive",
  "category": "appearance",
  "displayname": "橄榄皮",
  "enGenImage": "olive skin",
  "zhGenImage": "橄榄皮",
  "appliesTo": "skinColor"
},
"app_skin_very_dark": {
  "id": "app_skin_very_dark",
  "category": "appearance",
  "displayname": "极深肤色",
  "enGenImage": "very dark skin",
  "zhGenImage": "极深肤色",
  "appliesTo": "skinColor"
},
"app_skin_wheat": {
  "id": "app_skin_wheat",
  "category": "appearance",
  "displayname": "小麦色",
  "enGenImage": "wheat skin",
  "zhGenImage": "小麦色",
  "appliesTo": "skinColor"
},
"clothing_accessory_scarf": {
  "id": "clothing_accessory_scarf",
  "category": "clothing",
  "displayname": "围巾",
  "enGenImage": "scarf",
  "zhGenImage": "围巾",
  "appliesTo": "accessory",
  "allowColor": true
},
"clothing_school_tie": {
  "id": "clothing_school_tie",
  "category": "clothing",
  "displayname": "校服领带",
  "enGenImage": "school tie",
  "zhGenImage": "校服领带",
  "appliesTo": "accessory",
  "allowColor": true
},
"clothing_base_T": {
  "id": "clothing_base_T",
  "category": "clothing",
  "displayname": "T恤",
  "enGenImage": "T-shirt",
  "zhGenImage": "T恤",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_base_polo": {
  "id": "clothing_base_polo",
  "category": "clothing",
  "displayname": "polo衫",
  "enGenImage": "polo shirt",
  "zhGenImage": "polo衫",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_school_shirt": {
  "id": "clothing_school_shirt",
  "category": "clothing",
  "displayname": "校服衬衫",
  "enGenImage": "school shirt",
  "zhGenImage": "校服衬衫",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_school_skirt": {
  "id": "clothing_school_skirt",
  "category": "clothing",
  "displayname": "校服短裙",
  "enGenImage": "school skirt",
  "zhGenImage": "校服短裙",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_school_trousers": {
  "id": "clothing_school_trousers",
  "category": "clothing",
  "displayname": "校服长裤",
  "enGenImage": "school trousers",
  "zhGenImage": "校服长裤",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_top_hoodie": {
  "id": "clothing_top_hoodie",
  "category": "clothing",
  "displayname": "连帽衫",
  "enGenImage": "hoodie",
  "zhGenImage": "连帽衫",
  "appliesTo": "baseLayer",
  "allowColor": true
},
"clothing_casual_jacket": {
  "id": "clothing_casual_jacket",
  "category": "clothing",
  "displayname": "夹克",
  "enGenImage": "jacket",
  "zhGenImage": "夹克",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_dress_evening": {
  "id": "clothing_dress_evening",
  "category": "clothing",
  "displayname": "晚礼服",
  "enGenImage": "evening gown",
  "zhGenImage": "晚礼服",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_dress_red": {
  "id": "clothing_dress_red",
  "category": "clothing",
  "displayname": "连衣裙",
  "enGenImage": "dress",
  "zhGenImage": "连衣裙",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_formal_suit": {
  "id": "clothing_formal_suit",
  "category": "clothing",
  "displayname": "西服",
  "enGenImage": "suit",
  "zhGenImage": "西服",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_jacket_leather": {
  "id": "clothing_jacket_leather",
  "category": "clothing",
  "displayname": "皮夹克",
  "enGenImage": "leather jacket",
  "zhGenImage": "皮夹克",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_outer_blue": {
  "id": "clothing_outer_blue",
  "category": "clothing",
  "displayname": "外套",
  "enGenImage": "jacket",
  "zhGenImage": "外套",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_school_blazer": {
  "id": "clothing_school_blazer",
  "category": "clothing",
  "displayname": "校服外套",
  "enGenImage": "school blazer",
  "zhGenImage": "校服外套",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_traditional_hanfu": {
  "id": "clothing_traditional_hanfu",
  "category": "clothing",
  "displayname": "汉服",
  "enGenImage": "hanfu",
  "zhGenImage": "汉服",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"clothing_traditional_kimono": {
  "id": "clothing_traditional_kimono",
  "category": "clothing",
  "displayname": "和服",
  "enGenImage": "kimono",
  "zhGenImage": "和服",
  "appliesTo": "outerLayer",
  "allowColor": true
},
"mood_angry": {
  "id": "mood_angry",
  "category": "dynamic",
  "displayname": "愤怒",
  "enGenImage": "angry",
  "zhGenImage": "愤怒",
  "appliesTo": "mood"
},
"mood_anxious": {
  "id": "mood_anxious",
  "category": "dynamic",
  "displayname": "焦虑",
  "enGenImage": "anxious",
  "zhGenImage": "焦虑",
  "appliesTo": "mood"
},
"mood_confident": {
  "id": "mood_confident",
  "category": "dynamic",
  "displayname": "自信",
  "enGenImage": "confident",
  "zhGenImage": "自信",
  "appliesTo": "mood"
},
"mood_confused": {
  "id": "mood_confused",
  "category": "dynamic",
  "displayname": "困惑",
  "enGenImage": "confused",
  "zhGenImage": "困惑",
  "appliesTo": "mood"
},
"mood_happy": {
  "id": "mood_happy",
  "category": "dynamic",
  "displayname": "开心",
  "enGenImage": "happy",
  "zhGenImage": "开心",
  "appliesTo": "mood"
},
"mood_relaxed": {
  "id": "mood_relaxed",
  "category": "dynamic",
  "displayname": "放松",
  "enGenImage": "relaxed",
  "zhGenImage": "放松",
  "appliesTo": "mood"
},
"mood_sad": {
  "id": "mood_sad",
  "category": "dynamic",
  "displayname": "伤心",
  "enGenImage": "sad",
  "zhGenImage": "伤心",
  "appliesTo": "mood"
},
"mood_smirk": {
  "id": "mood_smirk",
  "category": "dynamic",
  "displayname": "得意微笑",
  "enGenImage": "smirk",
  "zhGenImage": "得意微笑",
  "appliesTo": "mood"
},
"mood_surprised": {
  "id": "mood_surprised",
  "category": "dynamic",
  "displayname": "惊讶",
  "enGenImage": "surprised",
  "zhGenImage": "惊讶",
  "appliesTo": "mood"
},
"mood_thoughtful": {
  "id": "mood_thoughtful",
  "category": "dynamic",
  "displayname": "沉思",
  "enGenImage": "thoughtful",
  "zhGenImage": "沉思",
  "appliesTo": "mood"
},
"mood_winking": {
  "id": "mood_winking",
  "category": "dynamic",
  "displayname": "眨眼",
  "enGenImage": "winking",
  "zhGenImage": "眨眼",
  "appliesTo": "mood"
},
"equip_accessory_belt": {
  "id": "equip_accessory_belt",
  "category": "equipment",
  "displayname": "腰带",
  "enGenImage": "belt",
  "zhGenImage": "腰带",
  "appliesTo": "accessory"
},
"equip_accessory_bracelet": {
  "id": "equip_accessory_bracelet",
  "category": "equipment",
  "displayname": "手镯",
  "enGenImage": "bracelet",
  "zhGenImage": "手镯",
  "appliesTo": "accessory"
},
"equip_accessory_earrings": {
  "id": "equip_accessory_earrings",
  "category": "equipment",
  "displayname": "优雅耳环",
  "enGenImage": "elegant earrings",
  "zhGenImage": "优雅耳环",
  "appliesTo": "accessory"
},
"equip_accessory_necklace": {
  "id": "equip_accessory_necklace",
  "category": "equipment",
  "displayname": "项链",
  "enGenImage": "necklace",
  "zhGenImage": "项链",
  "appliesTo": "accessory"
},
"equip_accessory_ring": {
  "id": "equip_accessory_ring",
  "category": "equipment",
  "displayname": "戒指",
  "enGenImage": "ring",
  "zhGenImage": "戒指",
  "appliesTo": "accessory"
},
"equip_accessory_watch": {
  "id": "equip_accessory_watch",
  "category": "equipment",
  "displayname": "手表",
  "enGenImage": "watch",
  "zhGenImage": "手表",
  "appliesTo": "accessory"
},
"equip_body_armor": {
  "id": "equip_body_armor",
  "category": "equipment",
  "displayname": "钢铁护甲",
  "enGenImage": "steel armor",
  "zhGenImage": "钢铁护甲",
  "appliesTo": "body"
},
"equip_foot_boots": {
  "id": "equip_foot_boots",
  "category": "equipment",
  "displayname": "靴子",
  "enGenImage": "boots",
  "zhGenImage": "靴子",
  "appliesTo": "foot",
  "allowColor": true
},
"equip_foot_school_shoes": {
  "id": "equip_foot_school_shoes",
  "category": "equipment",
  "displayname": "校服鞋",
  "enGenImage": "school shoes",
  "zhGenImage": "校服鞋",
  "appliesTo": "foot",
  "allowColor": true
},
"equip_foot_sneakers": {
  "id": "equip_foot_sneakers",
  "category": "equipment",
  "displayname": "运动鞋",
  "enGenImage": "sneakers",
  "zhGenImage": "运动鞋",
  "appliesTo": "foot",
  "allowColor": true
},
"equip_head_glasses": {
  "id": "equip_head_glasses",
  "category": "equipment",
  "displayname": "时尚眼镜",
  "enGenImage": "stylish glasses",
  "zhGenImage": "时尚眼镜",
  "appliesTo": "head",
  "allowColor": true
},
"equip_head_hat": {
  "id": "equip_head_hat",
  "category": "equipment",
  "displayname": "帽子",
  "enGenImage": "hat",
  "zhGenImage": "帽子",
  "appliesTo": "head",
  "allowColor": true
},
"equip_head_mask": {
  "id": "equip_head_mask",
  "category": "equipment",
  "displayname": "口罩",
  "enGenImage": "mask",
  "zhGenImage": "口罩",
  "appliesTo": "head",
  "allowColor": true
},
"tag_adventurous": {
  "id": "tag_adventurous",
  "category": "tag",
  "displayname": "爱冒险",
  "enGenImage": "adventurous",
  "zhGenImage": "爱冒险",
  "appliesTo": "tags"
},
"tag_artistic": {
  "id": "tag_artistic",
  "category": "tag",
  "displayname": "艺术家",
  "enGenImage": "artistic",
  "zhGenImage": "艺术家",
  "appliesTo": "tags"
},
"tag_charming": {
  "id": "tag_charming",
  "category": "tag",
  "displayname": "迷人",
  "enGenImage": "charming",
  "zhGenImage": "迷人",
  "appliesTo": "tags"
},
"tag_cool": {
  "id": "tag_cool",
  "category": "tag",
  "displayname": "冷酷",
  "enGenImage": "cool",
  "zhGenImage": "冷酷",
  "appliesTo": "tags"
},
"tag_elegant": {
  "id": "tag_elegant",
  "category": "tag",
  "displayname": "优雅",
  "enGenImage": "elegant",
  "zhGenImage": "优雅",
  "appliesTo": "tags"
},
"tag_energetic": {
  "id": "tag_energetic",
  "category": "tag",
  "displayname": "活力",
  "enGenImage": "energetic",
  "zhGenImage": "活力",
  "appliesTo": "tags"
},
"tag_friendly": {
  "id": "tag_friendly",
  "category": "tag",
  "displayname": "友好",
  "enGenImage": "friendly",
  "zhGenImage": "友好",
  "appliesTo": "tags"
},
"tag_humorous": {
  "id": "tag_humorous",
  "category": "tag",
  "displayname": "幽默",
  "enGenImage": "humorous",
  "zhGenImage": "幽默",
  "appliesTo": "tags"
},
"tag_intellectual": {
  "id": "tag_intellectual",
  "category": "tag",
  "displayname": "智慧",
  "enGenImage": "intellectual",
  "zhGenImage": "智慧",
  "appliesTo": "tags"
},
"tag_lazy": {
  "id": "tag_lazy",
  "category": "tag",
  "displayname": "懒散",
  "enGenImage": "lazy",
  "zhGenImage": "懒散",
  "appliesTo": "tags"
},
"tag_leader": {
  "id": "tag_leader",
  "category": "tag",
  "displayname": "领袖",
  "enGenImage": "leader",
  "zhGenImage": "领袖",
  "appliesTo": "tags"
},
"tag_mysterious": {
  "id": "tag_mysterious",
  "category": "tag",
  "displayname": "神秘",
  "enGenImage": "mysterious",
  "zhGenImage": "神秘",
  "appliesTo": "tags"
},
"tag_romantic": {
  "id": "tag_romantic",
  "category": "tag",
  "displayname": "浪漫",
  "enGenImage": "romantic",
  "zhGenImage": "浪漫",
  "appliesTo": "tags"
},
"tag_smart": {
  "id": "tag_smart",
  "category": "tag",
  "displayname": "机敏",
  "enGenImage": "smart",
  "zhGenImage": "机敏",
  "appliesTo": "tags"
},
"tag_strong": {
  "id": "tag_strong",
  "category": "tag",
  "displayname": "坚韧",
  "enGenImage": "tough",
  "zhGenImage": "坚韧",
  "appliesTo": "tags"
}
};