export interface ColorMappingEntry {
  id: string;
  enDescription: string;
  zhDescription: string;
}

export const ColorMapping: Record<string, ColorMappingEntry> = {
  // 基础中性色
  color_black: {
    id: "color_black",
    enDescription: "black",
    zhDescription: "黑色",
  },
  color_white: {
    id: "color_white",
    enDescription: "white",
    zhDescription: "白色",
  },
  color_gray: {
    id: "color_gray",
    enDescription: "gray",
    zhDescription: "灰色",
  },

  // 彩虹及过渡色
  color_red: {
    id: "color_red",
    enDescription: "red",
    zhDescription: "红色",
  },
  color_brown: {
    id: "color_brown",
    enDescription: "brown",
    zhDescription: "棕色",
  },
  color_orange: {
    id: "color_orange",
    enDescription: "orange",
    zhDescription: "橙色",
  },
  color_orange_yellow: {
    id: "color_orange_yellow",
    enDescription: "orange-yellow",
    zhDescription: "橙黄色",
  },
  color_yellow: {
    id: "color_yellow",
    enDescription: "yellow",
    zhDescription: "黄色",
  },
  color_yellow_green: {
    id: "color_yellow_green",
    enDescription: "yellow-green",
    zhDescription: "黄绿色",
  },
  color_green: {
    id: "color_green",
    enDescription: "green",
    zhDescription: "绿色",
  },
  color_cyan: {
    id: "color_cyan",
    enDescription: "cyan",
    zhDescription: "青色",
  },
  color_blue: {
    id: "color_blue",
    enDescription: "blue",
    zhDescription: "蓝色",
  },
  // 在蓝与紫之间添加过渡色：品红与粉色
  color_magenta: {
    id: "color_magenta",
    enDescription: "magenta",
    zhDescription: "品红",
  },
  color_pink: {
    id: "color_pink",
    enDescription: "pink",
    zhDescription: "粉色",
  },
  color_purple: {
    id: "color_purple",
    enDescription: "purple",
    zhDescription: "紫色",
  },
};
