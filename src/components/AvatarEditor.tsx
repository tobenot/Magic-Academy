import React, { useState, useRef, useEffect } from "react";
import { AvatarMapping, AvatarMappingEntry } from "../config/avatarMapping";
import { AvatarCustomization } from "../types/avatar";
import { ColorMapping } from "../config/colorMapping";

// 新增导出类型 AvatarAppearance，方便容器组件引入
export type AvatarAppearance = AvatarCustomization;

interface AvatarEditorProps {
  initialAppearance: AvatarAppearance;
  initialImageUrl?: string;
  onSave: (newAppearance: AvatarAppearance) => Promise<string>; // 返回图片 URL
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
      { label: "光照效果", key: "lighting" },
      { label: "阵营", key: "faction" },
    ],
  },
  {
    title: "标签",
    key: "tags",
    fields: [{ label: "标签", key: "tags", multi: true }],
  },
];

const DropdownMenu = ({
  options,
  value,
  onChange,
}: {
  options: AvatarMappingEntry[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm 
                 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                 transition duration-150 ease-in-out"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-800">
            {selectedOption?.displayname || "请选择"}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 text-gray-600 ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-dropdown animate-dropdown-open">
          <div className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100
                          ${value === option.id ? "bg-gray-50 font-medium" : ""}
                          transition duration-150 ease-in-out`}
              >
                <div className="flex items-center">
                  <span>{option.displayname}</span>
                  {value === option.id && (
                    <svg
                      className="w-5 h-5 ml-2 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialAppearance,
  initialImageUrl,
  onSave,
  onCancel,
}) => {
  // 使用 initialAppearance 初始化状态
  const [appearance, setAppearance] =
    useState<AvatarAppearance>(initialAppearance);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 用于显示生成的立绘图片 URL 的状态
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    initialImageUrl || null,
  );
  // 生成中状态
  const [generating, setGenerating] = useState<boolean>(false);

  // 更新颜色的辅助函数
  const handleColorChange = (
    sectionKey: string,
    fieldKey: string,
    color: string,
  ) => {
    setAppearance((prev: AvatarAppearance) => {
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

  // 调用后端接口生成立绘
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
      // 改为获取 onSave 返回的图片 URL
      const imageUrl = await onSave(appearance);
      setGeneratedImageUrl(imageUrl);
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
      setAppearance((prev) => {
        const currentValue = (prev as any)[sectionKey]?.[fieldKey];
        // 如果当前字段已经是对象（带有 color 属性），则只更新 id，保留原有的 color
        if (typeof currentValue === "object" && currentValue !== null) {
          return {
            ...prev,
            [sectionKey]: {
              ...(prev as any)[sectionKey],
              [fieldKey]: {
                id: value,
                color: currentValue.color,
              },
            },
          };
        }
        return {
          ...prev,
          [sectionKey]: {
            ...(prev as any)[sectionKey],
            [fieldKey]: value,
          },
        };
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900 to-gray-900/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div className="relative bg-white/20 border border-purple-400/50 rounded-2xl shadow-xl backdrop-blur-sm max-w-5xl w-full overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* 左侧 "镜子"区域：固定 320x480（2:3 比例），包装成镜子效果 */}
          <div className="flex-none p-4 flex items-center justify-center">
            <div className="w-[320px] h-[480px] border-4 border-gray-300 rounded-lg shadow-2xl relative">
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="生成的立绘"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white">立绘预览区域</span>
                )}
              </div>
            </div>
          </div>

          {/* 右侧编辑区域：采用 flex-col 布局，内容区域滚动，按钮固定在底部 */}
          <div className="flex-grow p-4 max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-extrabold text-white mb-4">
              编辑立绘外观
            </h2>
            {error && <div className="mb-4 text-red-400">{error}</div>}
            {/* 滚动区域 */}
            <div className="flex-grow overflow-y-auto">
              <form id="avatarEditorForm" onSubmit={handleSubmit}>
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
                                handleChange(
                                  section.key,
                                  field.key,
                                  selectedOptions,
                                );
                              }}
                              className="w-full p-3 rounded bg-white/30 text-white border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {Object.values(AvatarMapping)
                                .filter(
                                  (option) => option.appliesTo === field.key,
                                )
                                .map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.displayname}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <div className="space-y-2">
                              {(() => {
                                // 先得到原始选项
                                const baseOptions = Object.values(AvatarMapping).filter(
                                  (option) => option.appliesTo === field.key,
                                );
                                // 如果当前 section 是装备，则增加默认选项
                                const options =
                                  section.key === "equipment"
                                    ? [
                                        {
                                          id: "",
                                          displayname: "默认",
                                          appliesTo: field.key,
                                          allowColor: false,
                                        },
                                        ...baseOptions,
                                      ]
                                    : baseOptions;
                                return (
                                  <DropdownMenu
                                    options={options}
                                    value={
                                      typeof (appearance as any)[section.key]?.[
                                        field.key
                                      ] === "object"
                                        ? (appearance as any)[section.key][
                                            field.key
                                          ].id
                                        : (appearance as any)[section.key]?.[
                                            field.key
                                          ] || ""
                                    }
                                    onChange={(value) =>
                                      handleChange(section.key, field.key, value)
                                    }
                                    label={field.label}
                                  />
                                );
                              })()}
                              {(() => {
                                const currentVal = (appearance as any)[section.key]?.[field.key];
                                const currentId =
                                  typeof currentVal === "object" && currentVal !== null
                                    ? currentVal.id
                                    : currentVal;
                                const currentOption = Object.values(AvatarMapping).find(
                                  (option) => option.id === currentId,
                                );

                                // 只在允许颜色选择的选项下显示颜色选择器
                                if (currentOption?.allowColor) {
                                  return (
                                    <div className="mt-4">
                                      <label className="block text-white mb-1">
                                        颜色
                                      </label>
                                      <div className="relative">
                                        <select
                                          value={
                                            typeof currentVal === "object" &&
                                            currentVal !== null
                                              ? currentVal.color || ""
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleColorChange(
                                              section.key,
                                              field.key,
                                              e.target.value,
                                            )
                                          }
                                          className="w-full p-3 rounded bg-white/30 text-white border border-purple-400/50 
                                                   focus:outline-none focus:ring-2 focus:ring-purple-500 
                                                   appearance-none cursor-pointer hover:bg-white/40 transition-colors"
                                        >
                                          {Object.values(ColorMapping).map((option) => (
                                            <option
                                              key={option.id}
                                              value={option.id}
                                              className="bg-gray-800 text-white"
                                            >
                                              {option.zhDescription}
                                            </option>
                                          ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                          <svg 
                                            className="w-5 h-5 text-white" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={2} 
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </form>
            </div>
            {/* 固定的按钮区域，不随滚动 */}
            <div className="flex-none mt-4">
              <div className="flex justify-start space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition"
                >
                  关闭
                </button>
                <button
                  type="submit"
                  form="avatarEditorForm"
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
                  {generating ? "生成中..." : "重新生成立绘"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;
