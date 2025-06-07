import React, { useState } from "react";

interface CGModalProps {
	imageUrl: string;
	onClose: () => void;
}

const CGModal: React.FC<CGModalProps> = ({ imageUrl, onClose }) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeInUp"
			onClick={onClose}
		>
			<div
				className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 group w-12 h-12 bg-black/50 hover:bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
				>
					<span className="text-white group-hover:text-white text-xl font-bold">×</span>
				</button>

				{/* Download Button */}
				<a
					href={imageUrl}
					download="cg-image.jpg"
					className="absolute top-4 left-4 z-10 group flex items-center space-x-2 px-4 py-2 bg-black/50 hover:bg-blue-500/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-105 border border-white/20"
				>
					<span className="text-white text-sm">💾</span>
					<span className="text-white text-sm font-medium">下载</span>
				</a>

				{/* Loading State */}
				{!imageLoaded && !imageError && (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl">
						<div className="flex flex-col items-center space-y-4">
							<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
							<p className="text-white/80 text-lg font-medium">正在加载图片...</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{imageError && (
					<div className="flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-red-900/20 to-red-800/30 backdrop-blur-sm rounded-2xl p-12 border border-red-500/20">
						<div className="text-6xl">❌</div>
						<div className="text-center space-y-2">
							<h3 className="text-white text-xl font-bold">图片加载失败</h3>
							<p className="text-white/70">无法显示CG图片，请稍后重试</p>
						</div>
						<button
							onClick={onClose}
							className="px-6 py-3 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 font-medium"
						>
							关闭
						</button>
					</div>
				)}

				{/* Image Container */}
				<div className="relative w-full h-full flex items-center justify-center">
					<div className="relative max-w-full max-h-full bg-gradient-to-br from-gray-800/20 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
						<img
							src={imageUrl}
							alt="CG Image"
							className={`max-w-full max-h-full object-contain transition-all duration-500 ${
								imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
							}`}
							onLoad={() => setImageLoaded(true)}
							onError={() => setImageError(true)}
						/>
						
						{/* Image Overlay Effects */}
						{imageLoaded && (
							<>
								{/* Subtle border glow */}
								<div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50 pointer-events-none"></div>
								
								{/* Corner decorations */}
								<div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl-lg"></div>
								<div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary/50 rounded-tr-lg"></div>
								<div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary/50 rounded-bl-lg"></div>
								<div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary/50 rounded-br-lg"></div>
							</>
						)}
					</div>
				</div>

				{/* Instructions */}
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
					<p className="text-white/80 text-sm font-medium">点击背景或按ESC键关闭</p>
				</div>
			</div>
		</div>
	);
};

export default CGModal;
