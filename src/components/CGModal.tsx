import React from "react";

interface CGModalProps {
  imageUrl: string;
  onClose: () => void;
}

const CGModal: React.FC<CGModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="relative bg-white rounded-lg"
        style={{ width: "1024px", height: "768px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black bg-gray-200 rounded px-2 py-1"
        >
          关闭
        </button>
        <img
          src={imageUrl}
          alt="CG Image"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default CGModal;
