import React from "react";

interface SkeletonGridProps {
  columns?: number;
  rows?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  columns = 3,
  rows = 2,
}) => {
  const items = Array.from({ length: columns * rows });

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-${columns} lg:grid-cols-${columns} gap-6`}
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
        >
          <div className="w-full h-40 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="flex justify-between items-center mt-4">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
