import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentProfile,
  fetchStudentBookings,
  cancelBooking,
  resetStudent,
} from "../../features/student/studentSlice";
import useStudentLogout from "../../hooks/useStudentLogout";
import type { RootState, AppDispatch } from "../../app/store";
import { COLOR_CLASSES, COLORS } from "../../constants/colors";
import bgWorld from "../../assets/bg-world.png";
import illustrationImg5 from "../../assets/Group_5.png";
import LoadingSpinner from "../../components/shared/LoadingSpinner";

const StudentProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const handleStudentLogout = useStudentLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(
    null
  );

  const { profile, bookings, loading, error } = useSelector(
    (state: RootState) => state.student
  );

  useEffect(() => {
    // Fetch student data when component mounts
    // dispatch(fetchStudentProfile());
    // dispatch(fetchStudentBookings());

    // Cleanup when component unmounts
    return () => {
      dispatch(resetStudent());
    };
  }, [dispatch]);

  const handleLogout = () => {
    handleStudentLogout();
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setCancellingBooking(bookingId);
      try {
        await dispatch(cancelBooking(bookingId)).unwrap();
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      } finally {
        setCancellingBooking(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        bgColor: COLOR_CLASSES.bgSuccess,
        textColor: "text-white",
      },
      booked: {
        label: "Booked",
        bgColor: COLOR_CLASSES.bgInfo,
        textColor: "text-white",
      },
      upcoming: {
        label: "Upcoming",
        bgColor: COLOR_CLASSES.bgWarning,
        textColor: "text-white",
      },
      cancelled: {
        label: "Cancelled",
        bgColor: COLOR_CLASSES.bgError,
        textColor: "text-white",
      },
      not_allotted: {
        label: "Not Allotted",
        bgColor: "bg-gray-500",
        textColor: "text-white",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <section
        className="relative"
        style={{
          backgroundImage: `url(${bgWorld})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 lg:px-28 bg-white/90 backdrop-blur-none">
          <div className="max-w-6xl mx-auto py-6 md:py-8">
            {/* Loading State */}
            {loading && !profile && (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner variant="spinner" size="lg" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => {
                    dispatch(fetchStudentProfile());
                    dispatch(fetchStudentBookings());
                  }}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Content - only show if profile is loaded */}
            {profile && (
              <>
                {/* Navigation Tabs */}
                <div className="mb-6 md:mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                          activeTab === "profile"
                            ? `${COLOR_CLASSES.borderTertiary} ${COLOR_CLASSES.textTertiary}`
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => setActiveTab("bookings")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm md:text-base whitespace-nowrap ${
                          activeTab === "bookings"
                            ? `${COLOR_CLASSES.borderTertiary} ${COLOR_CLASSES.textTertiary}`
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        My Bookings
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Profile Tab Content */}
                {activeTab === "profile" && (
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0">
                      {/* Left Side - Account Information */}
                      <div className="p-4 md:p-6 lg:p-8 xl:p-12">
                        <div className="mb-6 md:mb-8">
                          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            Hi,{" "}
                            <span className={COLOR_CLASSES.textPrimary}>
                              {profile.studentName}!
                            </span>
                          </h1>
                          <p className="text-sm md:text-base text-gray-600">
                            Manage your account and view your learning progress
                          </p>
                        </div>

                        {/* Account Information Card */}
                        <div className={"bg-white rounded-2xl p-6 mb-8"}>
                          <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Account Information
                          </h2>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Parent Name
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.parentName}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Student Name
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.studentName}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Phone No
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.phone}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Email Id
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.email}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Total Classes
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.totalClasses}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">
                                Upcoming Classes
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {profile.upcomingClasses}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={() => setActiveTab("bookings")}
                            className={`flex-1 ${COLOR_CLASSES.bgTertiary} ${COLOR_CLASSES.hoverBgTertiary} text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl`}
                          >
                            My Bookings ({bookings.length})
                          </button>
                          <button
                            onClick={() => setShowLogoutModal(true)}
                            className={`flex-1 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl`}
                            style={{ backgroundColor: COLORS.error }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#D53F3F")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                COLORS.error)
                            }
                          >
                            Logout
                          </button>
                        </div>
                      </div>

                      {/* Right Side - Character Illustration */}
                      <div className="p-8 lg:p-12 flex items-center justify-center">
                        <div className="relative w-full max-w-md">
                          <img
                            src={illustrationImg5}
                            alt="Character Illustration"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bookings Tab Content */}
                {activeTab === "bookings" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-gray-900">
                        <span className="flex items-center">
                          <svg
                            className="w-8 h-8 mr-3 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 19l-7-7 7-7"
                            ></path>
                          </svg>
                          My Bookings
                        </span>
                      </h1>
                      <div className="text-sm text-gray-500">
                        Total: {bookings.length} bookings
                      </div>
                    </div>

                    {/* Loading State for Bookings */}
                    {loading && bookings.length === 0 && (
                      <div className="flex items-center justify-center py-12">
                        <LoadingSpinner variant="dots" size="md" />
                      </div>
                    )}

                    {/* No Bookings State */}
                    {!loading && bookings.length === 0 && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No bookings yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          You haven't made any course bookings yet. Start
                          exploring our courses!
                        </p>
                        <button
                          onClick={() =>
                            (window.location.href = "/student/courses")
                          }
                          className={`${COLOR_CLASSES.bgTertiary} ${COLOR_CLASSES.hoverBgTertiary} text-white px-6 py-3 rounded-lg font-medium transition duration-200`}
                        >
                          Browse Courses
                        </button>
                      </div>
                    )}

                    {/* Bookings List */}
                    {bookings.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-6 hover:bg-gray-50 transition duration-200"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {booking.title}
                                    </h3>
                                    {getStatusBadge(booking.status)}
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        ></path>
                                      </svg>
                                      <span className="font-medium">Date:</span>
                                      <span className="ml-1">
                                        {new Date(
                                          booking.date
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                      </svg>
                                      <span className="font-medium">Time:</span>
                                      <span className="ml-1">
                                        {booking.time}
                                      </span>
                                    </div>

                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        ></path>
                                      </svg>
                                      <span className="font-medium">
                                        Tutor:
                                      </span>
                                      <span className="ml-1">
                                        {booking.tutor}
                                      </span>
                                    </div>

                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        ></path>
                                      </svg>
                                      <span className="font-medium">
                                        Subject:
                                      </span>
                                      <span className="ml-1">
                                        {booking.subject} - {booking.class}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="ml-4">
                                  {booking.status === "upcoming" && (
                                    <button
                                      className={`${COLOR_CLASSES.bgTertiary} ${COLOR_CLASSES.hoverBgTertiary} text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200`}
                                    >
                                      Join Class
                                    </button>
                                  )}
                                  {booking.status === "booked" && (
                                    <div className="flex gap-2">
                                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
                                        Reschedule
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCancelBooking(booking.id)
                                        }
                                        disabled={
                                          cancellingBooking === booking.id
                                        }
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50"
                                      >
                                        {cancellingBooking === booking.id
                                          ? "Cancelling..."
                                          : "Cancel"}
                                      </button>
                                    </div>
                                  )}
                                  {booking.status === "not_allotted" && (
                                    <button
                                      className={`${COLOR_CLASSES.bgWarning} ${COLOR_CLASSES.hoverBgWarning} text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200`}
                                    >
                                      Contact Support
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Are you sure you want to logout?
              </h3>
              <p className="text-gray-600 mb-6">
                You'll need to login again to access your account.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex-1 text-white font-semibold py-3 px-6 rounded-xl transition duration-200`}
                  style={{ backgroundColor: COLORS.error }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#D53F3F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.error)
                  }
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
