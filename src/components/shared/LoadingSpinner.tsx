import React from "react";


interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "spinner" | "dots" | "pulse" | "wave";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  variant = "spinner",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  if (variant === "dots") {
    return (
      <div
        className={`flex justify-center items-center space-x-1 ${className}`}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`${dotSizes[size]} bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-bounce`}
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: "0.8s",
            }}
          ></div>
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse opacity-75`}
        ></div>
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div
        className={`flex justify-center items-center space-x-1 ${className}`}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`${dotSizes[size]} bg-gradient-to-t from-purple-600 to-blue-600 rounded-sm animate-wave`}
            style={{
              animationDelay: `${index * 0.1}s`,
              height: size === "sm" ? "8px" : size === "md" ? "16px" : "24px",
            }}
          ></div>
        ))}
      </div>
    );
  }

  // Default spinner variant with enhanced styling
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Outer ring with gradient */}
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}
        ></div>
        {/* Spinning gradient ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-transparent border-t-purple-600 border-r-blue-600 rounded-full animate-spin absolute top-0 left-0`}
          style={{
            background:
              "conic-gradient(from 0deg, transparent, #8b5cf6, #3b82f6, transparent)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
          }}
        ></div>
        {/* Inner glow effect */}
        <div
          className={`${sizeClasses[size]} border-2 border-purple-400 rounded-full absolute top-1 left-1 opacity-60 animate-pulse`}
          style={{
            width: `calc(100% - 8px)`,
            height: `calc(100% - 8px)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
