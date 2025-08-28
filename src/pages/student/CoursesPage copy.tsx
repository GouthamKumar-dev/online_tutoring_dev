import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { COLOR_CLASSES } from "../../constants/colors";
import StudentLoginModal from "../../components/StudentLoginModal";
import laptop_boy_img from "../../assets/laptop_boy_img.png";
import course_default_img from "../../assets/course_default_img.png";
import {
  fetchCourses,
  fetchAllCourses,
} from "../../features/courses/coursesSlice";
import type { RootState, AppDispatch } from "../../app/store";

const CoursesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.category);

  const {
    data: courses,
    meta,
    loading: coursesLoading,
    error: coursesError,
  } = useSelector((state: RootState) => state.courses);

  const { token, role } = useSelector((state: RootState) => state.auth);

  const loading = categoriesLoading || coursesLoading;
  const [showFilters, setShowFilters] = useState(false);

  // Separate temp filters for user selection (not applied until Apply Filter is clicked)
  const [tempFilters, setTempFilters] = useState<{
    categories: string[];
    subcategories: string[];
    search: string;
  }>({
    categories: [],
    subcategories: [],
    search: searchParams.get("search") || "",
  });

  // Applied filters (actually used for filtering courses)
  const [appliedFilters, setAppliedFilters] = useState<{
    categories: string[];
    subcategories: string[];
    search: string;
  }>({
    categories: [],
    subcategories: [],
    search: searchParams.get("search") || "",
  });

  // Modal state for booking
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    parentName: "",
    studentName: "",
    phoneNumber: "",
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch courses when applied filters or pagination change
  useEffect(() => {
    const filters: any = {
      page,
      limit,
    };

    if (appliedFilters.search) {
      filters.search = appliedFilters.search;
    }

    if (appliedFilters.categories.length > 0) {
      // Find category ID from name
      const category = categories.find((cat) =>
        appliedFilters.categories.includes(cat.categoryName || "")
      );
      if (category) {
        filters.categoryId = category.categoryId;
      }
    }

    if (appliedFilters.subcategories.length > 0) {
      // Find subcategory ID from name
      const subcategory = categories
        .flatMap((cat) => cat.subcategories || [])
        .find((subcat) =>
          appliedFilters.subcategories.includes(subcat.subcategoryName || "")
        );
      if (subcategory) {
        filters.subcategoryId = subcategory.subcategoryId;
      }
    }

    dispatch(fetchCourses(filters));
  }, [dispatch, appliedFilters, categories, page, limit]);

  // Get subcategories for selected categories
  const getSubcategoriesForSelectedCategories = () => {
    if (!tempFilters.categories.length) return [];

    const subcategories: string[] = [];
    tempFilters.categories.forEach((categoryName) => {
      const category = categories.find(
        (cat) => cat.categoryName === categoryName
      );
      if (category && category.subcategories) {
        category.subcategories.forEach((subcat) => {
          if (subcat.subcategoryName) {
            if (!subcategories.includes(subcat.subcategoryName)) {
              subcategories.push(subcat.subcategoryName);
            }
          }
        });
      }
    });
    return subcategories;
  };

  // Handle initial filters from URL params
  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || "";

    if (initialSearch || initialCategory) {
      const initialFilters = {
        categories: initialCategory ? [initialCategory] : [],
        subcategories: [],
        levels: [],
        languages: [],
        search: initialSearch,
      };
      setTempFilters(initialFilters);
      setAppliedFilters(initialFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (
    type: "categories" | "subcategories",
    value: string
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });

    // Update URL search params
    const searchParams = new URLSearchParams();
    if (tempFilters.search) searchParams.set("search", tempFilters.search);
    if (tempFilters.categories.length > 0) {
      searchParams.set("category", tempFilters.categories[0]);
    }
    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const clearFilters = () => {
    const emptyFilters = {
      categories: [],
      subcategories: [],
      levels: [],
      languages: [],
      search: "",
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);

    // Clear URL params
    navigate({
      pathname: location.pathname,
      search: "",
    });
  };

  const handleBookNow = (course: any) => {
    // Check if student is logged in
    if (!token || role !== "student") {
      // If not logged in, show login modal
      setSelectedCourse(course);
      setShowLoginModal(true);
    } else {
      // If already logged in, navigate to the course booking page
      navigate(`/course/${course.classId}/book`, {
        state: { course },
      });
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, proceed with booking
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.classId}/book`, {
        state: { course: selectedCourse },
      });
    }
    setShowLoginModal(false);
    setSelectedCourse(null);
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    setSelectedCourse(null);
    setBookingForm({
      parentName: "",
      studentName: "",
      phoneNumber: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 md:py-20">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {appliedFilters.categories.length > 0
              ? `${appliedFilters.categories.join(", ")} Courses`
              : "All Courses"}
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Discover the perfect course for your learning journey
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full ${COLOR_CLASSES.bgPrimary} text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              Filters{" "}
              {appliedFilters.categories.length +
                appliedFilters.subcategories.length >
                0 &&
                `(${
                  appliedFilters.categories.length +
                  appliedFilters.subcategories.length
                })`}
            </button>
          </div>

          {/* Sidebar Filters */}
          <div
            className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className={`${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverTextPrimary} text-sm`}
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Courses
                </label>
                <input
                  type="text"
                  value={tempFilters.search}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  placeholder="Search courses..."
                  className={`w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                />
              </div>

              {/* Categories */}
              <div className="mb-4 md:mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories :</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleFilterChange(
                          "categories",
                          category.categoryName || ""
                        )
                      }
                      className={`block w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        tempFilters.categories.includes(
                          category.categoryName || ""
                        )
                          ? `${COLOR_CLASSES.bgPrimary} text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.categoryName || "Unnamed Category"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              {getSubcategoriesForSelectedCategories().length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Sub Categories :
                  </h4>
                  <div className="space-y-2">
                    {getSubcategoriesForSelectedCategories().map(
                      (subcategory) => (
                        <button
                          key={subcategory}
                          onClick={() =>
                            handleFilterChange("subcategories", subcategory)
                          }
                          className={`block w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                            tempFilters.subcategories.includes(subcategory)
                              ? `${COLOR_CLASSES.bgSecondary} text-white`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {subcategory}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Apply Filter Button */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleApplyFilters}
                  className={`w-full ${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white px-4 py-2 rounded-md font-medium transition duration-200`}
                >
                  Apply Filter (
                  {tempFilters.categories.length +
                    tempFilters.subcategories.length}
                  )
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Active Filters */}
            {(appliedFilters.categories.length > 0 ||
              appliedFilters.subcategories.length > 0 ||
              appliedFilters.search) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.search && (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.textPrimary}`}
                    >
                      Search: {appliedFilters.search}
                      <button
                        onClick={() => {
                          setAppliedFilters((prev) => ({
                            ...prev,
                            search: "",
                          }));
                          setTempFilters((prev) => ({ ...prev, search: "" }));
                        }}
                        className={`ml-2 ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverTextPrimary}`}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {appliedFilters.categories.map((category) => (
                    <span
                      key={category}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.textPrimary}`}
                    >
                      {category}
                      <button
                        onClick={() => {
                          const newCategories =
                            appliedFilters.categories.filter(
                              (c) => c !== category
                            );
                          setAppliedFilters((prev) => ({
                            ...prev,
                            categories: newCategories,
                          }));
                          setTempFilters((prev) => ({
                            ...prev,
                            categories: newCategories,
                          }));
                        }}
                        className={`ml-2 ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverTextPrimary}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {appliedFilters.subcategories.map((subcategory) => (
                    <span
                      key={subcategory}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {subcategory}
                      <button
                        onClick={() => {
                          const newSubcategories =
                            appliedFilters.subcategories.filter(
                              (s) => s !== subcategory
                            );
                          setAppliedFilters((prev) => ({
                            ...prev,
                            subcategories: newSubcategories,
                          }));
                          setTempFilters((prev) => ({
                            ...prev,
                            subcategories: newSubcategories,
                          }));
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {loading
                  ? "Loading courses..."
                  : `Showing ${courses.length} of ${
                      meta?.total ?? courses.length
                    } courses`}
              </p>
              {(categoriesError || coursesError) && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {categoriesError || coursesError}
                  </p>
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {meta && meta.total > limit && (
              <div className="flex justify-center items-center gap-2 my-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded-md border ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.bgSecondary} disabled:opacity-50`}
                >
                  Previous
                </button>
                <span className="mx-2 text-gray-700">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className={`px-3 py-2 rounded-md border ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.bgSecondary} disabled:opacity-50`}
                >
                  Next
                </button>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-4 px-2 py-1 border rounded"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Course Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div
                  className={`animate-spin rounded-full h-8 w-8 border-b-2 ${COLOR_CLASSES.borderPrimary}`}
                ></div>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <div
                    key={course.classId}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                  >
                    <div className="h-48 bg-white border-b border-gray-200">
                      <img
                        src={course_default_img}
                        alt="Course Image"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-medium ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.bgSecondary} px-2 py-1 rounded`}
                        >
                          {course.category?.categoryName || "Uncategorized"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.classFullname ||
                              course.className ||
                              "Unnamed Course"}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleBookNow(course)}
                          className={`${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="text-gray-400 text-6xl">
                  <img
                    src={laptop_boy_img}
                    alt="No courses available"
                    className="h-[15rem] w-[15rem]"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses available
                </h3>
                <p className="text-gray-600 text-xs mb-4">
                  Check back later for new courses or try different filters
                </p>
              </div>
            )}

            {/* No Results */}
            {!loading && courses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearFilters}
                  className={`${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white px-6 py-2 rounded-md`}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Login Modal for Course Booking */}
      <StudentLoginModal
        isOpen={showLoginModal}
        onClose={handleModalClose}
        onSuccess={handleLoginSuccess}
        mode="booking"
        courseDetails={
          selectedCourse
            ? {
                title: selectedCourse.fullName,
                level: selectedCourse.level,
                parentName: bookingForm.parentName,
                studentName: bookingForm.studentName,
                phoneNumber: bookingForm.phoneNumber,
              }
            : undefined
        }
      />
    </div>
  );
};

export default CoursesPage;
