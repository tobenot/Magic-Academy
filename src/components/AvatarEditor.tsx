import React, { useState } from "react";
import { AvatarMapping } from "../config/avatarMapping";
import { AvatarCustomization } from "../types/avatar";
import { ColorMapping } from "../config/colorMapping";

// 新增导出类型 AvatarAppearance，方便容器组件引入
export type AvatarAppearance = AvatarCustomization;

interface AvatarEditorProps {
  // 修改属性名和类型，和容器传入的保持一致
  initialAppearance: AvatarAppearance;
  onSave: (newAppearance: AvatarAppearance) => Promise<void>;
  onCancel: () => void;
}

// 定义字段类型，所有字段都有可选的 multi 属性
interface FieldDefinition {
  label: string;
  key: string;
  multi?: boolean;
}

const sections: { title: string; key: string; fields: FieldDefinition[] }[] = [
  {
    title: "外观",
    key: "appearance",
    fields: [
      { label: "身高", key: "height" },
      { label: "体型", key: "bodyType" },
      { label: "肤色", key: "skinColor" },
      { label: "性别", key: "gender" },
      { label: "眼睛颜色", key: "eyeColor" },
      { label: "异瞳", key: "heterochromia" },
      { label: "发型", key: "hairDescription" },
      { label: "面部特征", key: "facialFeatures" },
    ],
  },
  {
    title: "服饰",
    key: "clothing",
    fields: [
      { label: "打底", key: "baseLayer" },
      { label: "外套", key: "outerLayer" },
      { label: "配饰", key: "accessory" },
    ],
  },
  {
    title: "装备",
    key: "equipment",
    fields: [
      { label: "头部", key: "head" },
      { label: "身体", key: "body" },
      { label: "手臂", key: "arms" },
      { label: "腿部", key: "legs" },
      { label: "脚部", key: "feet" },
      { label: "配件", key: "accessory" },
    ],
  },
  {
    title: "动态层",
    key: "dynamicLayer",
    fields: [
      { label: "情绪", key: "mood" },
      { label: "伤疤", key: "scars" },
      { label: "阵营", key: "faction" },
    ],
  },
  {
    title: "标签",
    key: "tags",
    fields: [{ label: "标签", key: "tags", multi: true }],
  },
];

// 新增：更新颜色的辅助函数
const handleColorChange = (
  sectionKey: string,
  fieldKey: string,
  color: string,
) => {
  setAppearance((prev) => {
    const sectionValue = (prev as any)[sectionKey] || {};
    const currentValue = sectionValue[fieldKey];
    if (typeof currentValue === "object" && currentValue !== null) {
      return {
        ...prev,
        [sectionKey]: {
          ...sectionValue,
          [fieldKey]: {
            ...currentValue,
            color: color,
          },
        },
      };
    } else {
      // 如果之前为字符串或未设置，则转换为对象格式
      return {
        ...prev,
        [sectionKey]: {
          ...sectionValue,
          [fieldKey]: { id: currentValue || "", color: color },
        },
      };
    }
  });
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialAppearance,
  onSave,
  onCancel,
}) => {
  // 使用 initialAppearance 初始化状态
  const [appearance, setAppearance] =
    useState<AvatarAppearance>(initialAppearance);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 新增用于显示服务器生成图片 URL 的状态
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  // 新增生成中状态
  const [generating, setGenerating] = useState<boolean>(false);

  // 新增：调用后端接口生成立绘
  const handleGenerateAvatar = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录，请重新登录");
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/avatar/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setGeneratedImageUrl(result.imageUrl);
      } else {
        throw new Error(result.message || "生成立绘失败");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "生成立绘时发生错误");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(appearance);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    sectionKey: string,
    fieldKey: string,
    value: string | string[],
  ) => {
    if (sectionKey === "tags") {
      setAppearance((prev) => ({ ...prev, tags: value as string[] }));
    } else {
      setAppearance((prev) => ({
        ...prev,
        [sectionKey]: {
          ...(prev as any)[sectionKey],
          [fieldKey]: value,
        },
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div className="relative bg-white/20 border border-purple-400/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm min-w-[350px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-white mb-6">
          编辑立绘外观
        </h2>
        {error && <div className="mb-4 text-red-400">{error}</div>}
        <form onSubmit={handleSubmit}>
          {sections.map((section) => (
            <div
              key={section.key}
              className="mb-4 border border-white/20 rounded-lg"
            >
              <div className="bg-purple-900 px-4 py-2 rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">
                  {section.title}
                </h3>
              </div>
              <div className="p-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-white mb-1">
                      {field.label}
                    </label>
                    {field.multi ? (
                      <select
                        multiple
                        value={appearance.tags || []}
                        onChange={(e) => {
                          const selectedOptions = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value,
                          );
                          handleChange(section.key, field.key, selectedOptions);
                        }}
                        className="w-full p-3 rounded bg-white/30 text-white border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {Object.values(AvatarMapping)
                          .filter((option) => option.appliesTo === field.key)
                          .map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.displayname}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <>
                        <select
                          value={
                            (appearance as any)[section.key]?.[field.key] || ""
                          }
                          onChange={(e) =>
                            handleChange(section.key, field.key, e.target.value)
                          }
                          className="w-full p-3 rounded bg-white/30 text-white border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {(() => {
                            let isOptional = false;
                            if (
                              section.key === "appearance" &&
                              (field.key === "gender" ||
                                field.key === "heterochromia")
                            ) {
                              isOptional = true;
                            } else if (
                              section.key === "clothing" &&
                              (field.key === "outerLayer" ||
                                field.key === "accessory")
                            ) {
                              isOptional = true;
                            } else if (
                              section.key === "equipment" ||
                              section.key === "dynamicLayer"
                            ) {
                              isOptional = true;
                            }

                            const fieldOptions =
                              field.key === "gender"
                                ? Object.values(AvatarMapping).filter(
                                    (option) => option.id.startsWith("gender_"),
                                  )
                                : Object.values(AvatarMapping).filter(
                                    (option) => {
                                      if (Array.isArray(option.appliesTo)) {
                                        return option.appliesTo.includes(
                                          field.key,
                                        );
                                      }
                                      return option.appliesTo === field.key;
                                    },
                                  );

                            return (
                              <>
                                {isOptional && <option value="">无</option>}
                                {fieldOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.displayname}
                                  </option>
                                ))}
                              </>
                            );
                          })()}
                        </select>
                        {(() => {
                          // 获取当前字段的值
                          const currentVal = (appearance as any)[section.key]?.[
                            field.key
                          ];
                          // 如果是对象则取 id，否则直接使用
                          const currentId =
                            typeof currentVal === "object" &&
                            currentVal !== null
                              ? currentVal.id
                              : currentVal;
                          // 查找配置
                          const currentOption = Object.values(
                            AvatarMapping,
                          ).find((option) => option.id === currentId);
                          if (currentOption && currentOption.allowColor) {
                            return (
                              <div className="mt-2">
                                <label className="block text-white mb-1">
                                  颜色选择
                                </label>
                                <select
                                  value={
                                    typeof (appearance as any)[section.key]?.[
                                      field.key
                                    ] === "object" &&
                                    (appearance as any)[section.key]?.[
                                      field.key
                                    ] !== null
                                      ? (
                                          (appearance as any)[section.key][
                                            field.key
                                          ] as any
                                        ).color || ""
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleColorChange(
                                      section.key,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-3 rounded bg-white/30 text-white border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">默认</option>
                                  {Object.values(ColorMapping).map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.zhDescription}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              disabled={saving || generating}
              onClick={handleGenerateAvatar}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
            >
              {generating ? "生成中..." : "生成立绘"}
            </button>
          </div>
          {generatedImageUrl && (
            <div className="mt-4 text-center">
              <label className="block text-white mb-1">生成的立绘图片:</label>
              <img
                src={generatedImageUrl}
                alt="生成的立绘"
                className="mx-auto rounded shadow-lg"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AvatarEditor;
