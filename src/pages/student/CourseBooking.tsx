import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { COLOR_CLASSES } from "../../constants/colors";
import illustrationImg4 from "../../assets/Group_4.png";
import { createBookRequest } from "../../features/bookRequests/bookRequestsSlice";
import type { RootState, AppDispatch } from "../../app/store";

interface BookingFormData {
  parentName: string;
  studentName: string;
  phoneNumber: string;
  emailId: string;
}

const CourseBooking: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state

  const { actionLoading } = useSelector(
    (state: RootState) => state.bookRequests
  );

  // Get course data from location state or use default
  const courseData = location.state?.course || {
    classId: courseId,
    className: "Default Course",
    classFullname: "Default Course Full Name",
    category: { categoryName: "General" },
    subcategory: { subcategoryName: "General" },
  };

  const [formData, setFormData] = useState<BookingFormData>({
    parentName: "",
    studentName: "",
    phoneNumber: "",
    emailId: "",
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.parentName.trim())
      newErrors.parentName = "Parent name is required";
    if (!formData.studentName.trim())
      newErrors.studentName = "Student name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone number is invalid";
    if (formData.emailId.trim() && !/\S+@\S+\.\S+/.test(formData.emailId))
      newErrors.emailId = "Email is invalid";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Create booking request using API
      await dispatch(
        createBookRequest({
          parentName: formData.parentName,
          studentName: formData.studentName,
          phoneNumber: formData.phoneNumber,
          email: formData.emailId,
          courseId: courseId || "",
          courseName:
            courseData.classFullname ||
            courseData.className ||
            "Unknown Course",
        })
      ).unwrap();

      alert("Demo class booked successfully! We will contact you soon.");
      navigate("/courses");
    } catch (error: any) {
      alert(error.message || "Failed to book demo class. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              Course Details
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Course Info & Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12">
            {/* Course Title */}
            <div className="mb-8">
              <h2
                className={`text-3xl font-bold ${COLOR_CLASSES.textTertiary} mb-2`}
              >
                {courseData.classFullname || courseData.className || "Course"}
              </h2>
              <p className="text-gray-600">
                {courseData.category?.categoryName || "General"} »{" "}
                {courseData.subcategory?.subcategoryName || "Course"}
              </p>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Parent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Name
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) =>
                    handleInputChange("parentName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    COLOR_CLASSES.focusRingPrimary
                  } focus:border-transparent ${
                    errors.parentName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Daniel Roger"
                />
                {errors.parentName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.parentName}
                  </p>
                )}
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) =>
                    handleInputChange("studentName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    COLOR_CLASSES.focusRingPrimary
                  } focus:border-transparent ${
                    errors.studentName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Joseph Daniel"
                />
                {errors.studentName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.studentName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    COLOR_CLASSES.focusRingPrimary
                  } focus:border-transparent ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+919876543210"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Id (Optional)
                </label>
                <input
                  type="email"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    COLOR_CLASSES.focusRingPrimary
                  } focus:border-transparent ${
                    errors.emailId ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="danielroger123@gmail.com"
                />
                {errors.emailId && (
                  <p className="text-red-500 text-sm mt-1">{errors.emailId}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={actionLoading}
                className={`w-full py-4 rounded-lg font-semibold text-white transition duration-200 ${
                  actionLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : `${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary}`
                }`}
              >
                {actionLoading ? "Booking..." : "Book Now"}
              </button>
            </form>
          </div>

          {/* Right Side - Illustration & CTA */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-full max-w-lg mb-8">
              <img
                src={illustrationImg4}
                alt="Book Demo Illustration"
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-bold text-gray-900">
                Book for a{" "}
                <span className={COLOR_CLASSES.textTertiary}>free</span>
              </h3>
              <h3 className="text-4xl font-bold text-gray-700">
                demo class now
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBooking;
