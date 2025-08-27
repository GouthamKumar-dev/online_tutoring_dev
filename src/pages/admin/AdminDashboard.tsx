import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import { fetchCategories } from "../../features/category/categorySlice";
import { CHART_COLORS, COLOR_CLASSES } from "../../constants/colors";

ChartJS.register(ArcElement, Tooltip, Legend);

function getPieChartData(
  pie: Array<{ label: string; value: number; color: string }>
) {
  return {
    labels: pie.map((d) => d.label),
    datasets: [
      {
        data: pie.map((d) => d.value),
        backgroundColor: pie.map((d) => d.color),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 16,
      },
    ],
  };
}

const options: import("chart.js").ChartOptions<"pie"> = {
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.parsed || 0;
          return `\u25CF ${label}: ${value}%`;
        },
      },
      displayColors: true,
      backgroundColor: "#fff",
      titleColor: "#222",
      bodyColor: "#222",
      borderColor: "#eee",
      borderWidth: 1,
      bodyFont: { weight: 700 },
      padding: 12,
      caretSize: 8,
      cornerRadius: 8,
    },
  },
  cutout: "0%",
  responsive: true,
  maintainAspectRatio: false,
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector(
    (state: RootState) => state.category
  );
  const [drillPath, setDrillPath] = React.useState<string[]>([]);
  const chartRef = React.useRef<any>(null);

  // Fetch categories on mount
  React.useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Process categories data for pie chart
  const processDataForChart = (drillPath: string[]) => {
    if (drillPath.length === 0) {
      // Root level - show categories
      return categories.map((category: any, index: number) => ({
        label: category.categoryName,
        value: Math.round(
          ((category.allCourses?.length || 0) * 100) /
            Math.max(
              1,
              categories.reduce(
                (sum: number, cat: any) => sum + (cat.allCourses?.length || 0),
                0
              )
            )
        ),
        color: CHART_COLORS[index % CHART_COLORS.length],
        data: category,
      }));
    } else if (drillPath.length === 1) {
      // Category level - show subcategories + direct courses
      const category = categories.find(
        (cat: any) => cat.categoryName === drillPath[0]
      );
      if (!category) return [];

      const result:any = [];
      const totalItems =
        (category.subcategories?.length || 0) + (category.courses?.length || 0);

      // Add subcategories
      category.subcategories?.forEach((subcat: any, index: number) => {
        result.push({
          label: subcat.subcategoryName,
          value: Math.round(
            (((subcat.courses?.length || 0) + (subcat.children?.length || 0)) *
              100) /
              Math.max(1, totalItems)
          ),
          color: CHART_COLORS[index % CHART_COLORS.length],
          data: subcat,
          type: "subcategory",
        });
      });

      // Add direct courses
      category.courses?.forEach((course: any, index: number) => {
        result.push({
          label: course.className,
          value: Math.round(100 / Math.max(1, totalItems)),
          color:
            CHART_COLORS[
              (category.subcategories?.length || 0 + index) %
                CHART_COLORS.length
            ],
          data: course,
          type: "course",
        });
      });

      return result;
    } else if (drillPath.length === 2) {
      // Subcategory level - show nested subcategories + courses
      const category = categories.find(
        (cat: any) => cat.categoryName === drillPath[0]
      );
      const subcategory = category?.subcategories?.find(
        (sub: any) => sub.subcategoryName === drillPath[1]
      );
      if (!subcategory) return [];

      const result:any = [];
      const totalItems =
        (subcategory.children?.length || 0) +
        (subcategory.courses?.length || 0);

      // Add nested subcategories
      subcategory.children?.forEach((child: any, index: number) => {
        result.push({
          label: child.subcategoryName,
          value: Math.round(
            (((child.courses?.length || 0) + (child.children?.length || 0)) *
              100) /
              Math.max(1, totalItems)
          ),
          color: CHART_COLORS[index % CHART_COLORS.length],
          data: child,
          type: "subcategory",
        });
      });

      // Add courses
      subcategory.courses?.forEach((course: any, index: number) => {
        result.push({
          label: course.className,
          value: Math.round(100 / Math.max(1, totalItems)),
          color:
            CHART_COLORS[
              (subcategory.children?.length || 0 + index) % CHART_COLORS.length
            ],
          data: course,
          type: "course",
        });
      });

      return result;
    }

    return [];
  };

  // Get current drill data
  const getCurrentDrillData = () => {
    const data = processDataForChart(drillPath);
    // Ensure percentages add up to 100
    const total = data.reduce((sum:any, item:any) => sum + item.value, 0);
    if (total > 0 && total !== 100) {
      const factor = 100 / total;
      data.forEach((item:any) => {
        item.value = Math.round(item.value * factor);
      });
    }
    return data;
  };

  const chartData = getPieChartData(getCurrentDrillData());

  // Generate dynamic chart title
  const getChartTitle = () => {
    if (drillPath.length === 0) return "Categories Overview";
    if (drillPath.length === 1)
      return `${drillPath[0]} - Subcategories & Courses`;
    if (drillPath.length === 2) return `${drillPath[1]} - Contents`;
    return drillPath.join(" > ");
  };

  const chartTitle = getChartTitle();

  // Chart.js click handler for real data
  const handleChartClick = (event: any) => {
    const chart = chartRef.current;
    if (!chart) return;

    const points = chart.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      true
    );

    if (points.length > 0) {
      const idx = points[0].index;
      const currentData = getCurrentDrillData();
      const clickedItem = currentData[idx];

      if (!clickedItem) return;

      // Only drill down if it's a category or subcategory, not a course
      if (drillPath.length === 0 && clickedItem.data.subcategories) {
        // Clicking on a category
        setDrillPath([clickedItem.label]);
      } else if (drillPath.length === 1 && clickedItem.type === "subcategory") {
        // Clicking on a subcategory
        setDrillPath([...drillPath, clickedItem.label]);
      } else if (drillPath.length === 2 && clickedItem.type === "subcategory") {
        // Clicking on a nested subcategory
        setDrillPath([...drillPath, clickedItem.label]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4 xs:mb-6 gap-2 xs:gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm xs:text-base sm:text-lg font-medium">
            Educational Content Analytics
          </span>
          {/* Breadcrumb */}
          {drillPath.length > 0 && (
            <div className="text-xs xs:text-sm text-gray-600">
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => setDrillPath([])}
              >
                📊 All Categories
              </span>
              {drillPath.map((path, index) => (
                <span key={index}>
                  {" > "}
                  <span
                    className={
                      index < drillPath.length - 1
                        ? "cursor-pointer hover:text-blue-600"
                        : ""
                    }
                    onClick={() =>
                      index < drillPath.length - 1
                        ? setDrillPath(drillPath.slice(0, index + 1))
                        : undefined
                    }
                  >
                    {path}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          className={`flex items-center ${COLOR_CLASSES.bgSecondary}/20 rounded-lg px-2 xs:px-3 sm:px-4 py-1 text-xs xs:text-sm sm:text-base text-gray-600`}
        >
          <span className="font-semibold mr-1">28-05-2025</span> -
          <span className="font-semibold ml-1">28-06-2025</span>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 xs:gap-6 lg:gap-8">
        {/* Pie Chart Section */}
        <div className="bg-white rounded-2xl shadow p-2 xs:p-4 sm:p-6 md:p-8 flex-1 flex flex-col items-center min-w-0 w-full">
          <div className="w-full flex items-center justify-center mb-1 xs:mb-2">
            <div className="text-base xs:text-lg font-bold mb-1 xs:mb-2">
              {chartTitle}
            </div>
          </div>

          {loading ? (
            <div className="w-full flex items-center justify-center py-16">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : getCurrentDrillData().length === 0 ? (
            <div className="w-full flex items-center justify-center py-16">
              <div className="text-gray-500">No data available</div>
            </div>
          ) : (
            <>
              <div className="w-full flex items-center justify-center mb-4 xs:mb-6">
                <div className="w-36 h-36 xs:w-48 xs:h-48 sm:w-64 sm:h-56 md:w-80 md:h-56">
                  <Pie
                    ref={chartRef}
                    data={chartData}
                    options={options}
                    width={224}
                    height={224}
                    onClick={handleChartClick}
                  />
                </div>
              </div>
              <ul className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center text-xs xs:text-sm sm:text-base">
                {getCurrentDrillData().map((d: any) => (
                  <li key={d.label}>
                    <button
                      className={`inline-flex items-center px-2 py-1 rounded ${
                        COLOR_CLASSES.hoverBgSecondary
                      }/10 focus:outline-none text-xs xs:text-sm sm:text-base ${
                        d.type === "course" ? "opacity-75" : "hover:bg-gray-100"
                      }`}
                      style={{
                        cursor: d.type === "course" ? "default" : "pointer",
                      }}
                      onClick={() => {
                        if (d.type === "course") return; // Don't drill down on courses

                        if (drillPath.length === 0 && d.data.subcategories) {
                          setDrillPath([d.label]);
                        } else if (
                          drillPath.length === 1 &&
                          d.type === "subcategory"
                        ) {
                          setDrillPath([...drillPath, d.label]);
                        } else if (
                          drillPath.length === 2 &&
                          d.type === "subcategory"
                        ) {
                          setDrillPath([...drillPath, d.label]);
                        }
                      }}
                      title={
                        d.type === "course"
                          ? "Course (no drill-down)"
                          : "Click to drill down"
                      }
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{
                          background: d.color,
                          border: "1px solid #ccc",
                        }}
                      ></span>
                      {d.type === "course" && "📚 "}
                      {d.type === "subcategory" && "📁 "}
                      {d.label} {d.value}%
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {drillPath.length > 0 && (
            <button
              className={`mt-2 xs:mt-4 px-3 xs:px-4 py-2 rounded ${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.hoverBgSecondary} ${COLOR_CLASSES.textPrimary} font-semibold text-xs xs:text-sm sm:text-base`}
              onClick={() => setDrillPath(drillPath.slice(0, -1))}
            >
              Back
            </button>
          )}
        </div>
        {/* Statistics Section */}
        <div className="bg-white rounded-2xl shadow p-2 xs:p-4 sm:p-6 md:p-8 flex flex-col min-w-0 max-w-full w-full xs:w-auto lg:min-w-[220px] lg:max-w-xs">
          <div className="font-semibold text-sm xs:text-base mb-2 xs:mb-4">
            System Statistics
          </div>

          <div className="space-y-3">
            {/* Total Statistics */}
            <div
              className={`${COLOR_CLASSES.bgSecondary}/20 rounded-lg px-2 xs:px-3 py-2 text-xs xs:text-sm sm:text-base`}
            >
              <div className="font-semibold">📊 Total Categories</div>
              <div className="text-lg font-bold text-blue-600">
                {categories.length}
              </div>
            </div>

            <div
              className={`${COLOR_CLASSES.bgSecondary}/20 rounded-lg px-2 xs:px-3 py-2 text-xs xs:text-sm sm:text-base`}
            >
              <div className="font-semibold">📚 Total Courses</div>
              <div className="text-lg font-bold text-green-600">
                {categories.reduce(
                  (sum: number, cat: any) =>
                    sum + (cat.allCourses?.length || 0),
                  0
                )}
              </div>
            </div>

            <div
              className={`${COLOR_CLASSES.bgSecondary}/20 rounded-lg px-2 xs:px-3 py-2 text-xs xs:text-sm sm:text-base`}
            >
              <div className="font-semibold">📁 Total Subcategories</div>
              <div className="text-lg font-bold text-purple-600">
                {categories.reduce(
                  (sum: number, cat: any) =>
                    sum + (cat.subcategories?.length || 0),
                  0
                )}
              </div>
            </div>

            {/* Most Popular Category */}
            {categories.length > 0 && (
              <div
                className={`${COLOR_CLASSES.bgSecondary}/20 rounded-lg px-2 xs:px-3 py-2 text-xs xs:text-sm sm:text-base`}
              >
                <div className="font-semibold">🏆 Most Courses</div>
                <div className="text-sm text-gray-600">
                  {
                    categories.reduce((max: any, cat: any) =>
                      (cat.allCourses?.length || 0) >
                      (max.allCourses?.length || 0)
                        ? cat
                        : max
                    ).categoryName
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
