import React, { useState } from "react";
import { useSelector } from "react-redux";
import { COLOR_CLASSES } from "../constants/colors";
import StudentLoginModal from "./StudentLoginModal";
import illustrationImg from "../assets/Group_1.png"; // Updated to use the correct illustration image
import type { RootState } from "../app/store";

interface CourseBookingFormProps {
  course?: {
    id: string;
    title: string;
    level: string;
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

const CourseBookingForm: React.FC<CourseBookingFormProps> = ({
  course,
  onClose,
  onSuccess,
}) => {
  const { token, role } = useSelector((state: RootState) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    parentName: "",
    studentName: "",
    phoneNumber: "",
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookNow = () => {
    // If student is not logged in, show login modal
    if (!token || role !== "student") {
      setShowLoginModal(true);
    } else {
      // Proceed with booking
      handleBookingSubmit();
    }
  };

  const handleBookingSubmit = () => {
    // Process the booking
    console.log("Booking submitted:", formData);
    onSuccess?.();
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    handleBookingSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        <div className="flex">
          {/* Left Side - Course Info & Illustration */}
          <div
            className={`hidden md:flex md:w-1/2 ${COLOR_CLASSES.gradientFull} items-center justify-center p-8`}
          >
            <div className="text-center text-white">
              <img
                src={illustrationImg}
                alt="Student illustration"
                className="w-48 h-48 mx-auto mb-6"
              />
              <h3 className="text-2xl font-bold mb-2">Book for a free</h3>
              <p className="text-xl opacity-90 mb-4">demo class now</p>
              {course && (
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="font-semibold text-lg">{course.title}</p>
                  <p className="opacity-90">{course.level}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Class 10th Physics tution
                </h2>
                <p className="text-gray-600">Subject/Level/4</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                  placeholder="Daniel Roger"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                  placeholder="Joseph Daniel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                    placeholder="9876543210"
                  />
                  <button
                    type="button"
                    className={`ml-2 px-3 py-2 text-sm ${COLOR_CLASSES.bgSecondary} text-white rounded-md hover:opacity-90 transition-opacity`}
                  >
                    Verify OTP
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Id (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`}
                  placeholder="danielroger123@gmail.com"
                />
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className={`w-full py-3 px-4 ${COLOR_CLASSES.bgPrimary} text-white rounded-md ${COLOR_CLASSES.hoverBgPrimary} transition-colors font-semibold`}
              >
                Book Now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        mode="booking"
        courseDetails={
          course
            ? {
                title: course.title,
                level: course.level,
                parentName: formData.parentName,
                studentName: formData.studentName,
                phoneNumber: formData.phoneNumber,
              }
            : undefined
        }
      />
    </div>
  );
};

export default CourseBookingForm;
