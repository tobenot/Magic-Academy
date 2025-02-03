import React, { useState } from "react";
import { AvatarMapping } from "../config/avatarMapping";

// 定义外观属性接口
export interface AvatarAppearance {
  height: string;
  bodyType: string;
  skinColor: string;
  eyeColor: string;
  heterochromia: string;
  hairDescription: string;
  facialFeatures: string;
  gender: string;
}

interface AvatarEditorProps {
  initialAppearance: AvatarAppearance;
  // onSave 回调返回 Promise，当保存成功时，组件调用后续操作（如关闭面板）
  onSave: (newAppearance: AvatarAppearance) => Promise<void>;
  onCancel: () => void;
}

const appearanceFields = [
  { label: "身高", key: "height" },
  { label: "体型", key: "bodyType" },
  { label: "肤色", key: "skinColor" },
  { label: "性别", key: "gender" },
  { label: "眼睛颜色", key: "eyeColor" },
  { label: "异瞳", key: "heterochromia" },
  { label: "发型", key: "hairDescription" },
  { label: "面部特征", key: "facialFeatures" },
];

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialAppearance,
  onSave,
  onCancel,
}) => {
  const [appearance, setAppearance] =
    useState<AvatarAppearance>(initialAppearance);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleChange = (key: keyof AvatarAppearance, value: string) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fade-in">
      <div className="relative bg-white/10 p-6 rounded-xl shadow-2xl min-w-[300px]">
        <h2 className="text-xl font-bold text-white mb-4">编辑立绘外观</h2>
        {error && <div className="mb-4 text-red-400">{error}</div>}
        <form onSubmit={handleSubmit}>
          {appearanceFields.map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block text-white mb-1">{field.label}</label>
              <select
                value={appearance[field.key as keyof AvatarAppearance]}
                onChange={(e) =>
                  handleChange(
                    field.key as keyof AvatarAppearance,
                    e.target.value,
                  )
                }
                className="w-full p-2 rounded bg-white/20 text-white"
              >
                {Object.values(AvatarMapping)
                  .filter((option) => {
                    if (field.key === "gender") {
                      return option.id.startsWith("gender_");
                    }
                    return (
                      !option.id.startsWith("gender_") &&
                      option.category === "appearance"
                    );
                  })
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.description}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvatarEditor;
