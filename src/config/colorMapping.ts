export interface ColorMappingEntry {
  id: string;
  enDescription: string;
  zhDescription: string;
}

export const ColorMapping: Record<string, ColorMappingEntry> = {
  color_blue: {
    id: "color_blue",
    enDescription: "blue",
    zhDescription: "蓝色",
  },
  color_red: {
    id: "color_red",
    enDescription: "red",
    zhDescription: "红色",
  },
  color_bluewhite: {
    id: "color_bluewhite",
    enDescription: "blue-white",
    zhDescription: "蓝白混色",
  },
  // 可根据需要添加更多颜色配置
};
