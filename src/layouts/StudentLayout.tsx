import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import Logo from "../assets/logo.png";
import { COLOR_CLASSES, getColorClasses } from "../constants/colors";
import StudentLoginModal from "../components/StudentLoginModal";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, token } = useSelector((state: RootState) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = Boolean(token) && role === "student";

  // Function to determine if a navigation link is active
  const isActiveLink = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/courses") {
      return (
        location.pathname === "/courses" ||
        location.pathname.startsWith("/course/")
      );
    }
    if (path === "/student/profile") {
      return (
        location.pathname === "/student/profile" ||
        location.pathname === "/student/bookings"
      );
    }
    return location.pathname.startsWith(path);
  };

  // Function to get navigation link classes
  const getNavLinkClasses = (path: string): string => {
    const baseClasses = `${getColorClasses.link.nav} px-3 py-1 text-base font-medium transition duration-200`;
    const activeClasses = `border-b-2 ${COLOR_CLASSES.borderTertiary} ${COLOR_CLASSES.textTertiary}`;
    const inactiveClasses = `border-b-2 border-transparent hover:${COLOR_CLASSES.textTertiary}`;

    return `${baseClasses} ${
      isActiveLink(path) ? activeClasses : inactiveClasses
    }`;
  };

  // Function to get button classes with active state
  const getTutorSignupClasses = (): string => {
    const baseClasses = `px-6 py-1 rounded-full text-base font-medium transition duration-200`;
    const isActive = isActiveLink("/tutor/signup");

    if (isActive) {
      return `${baseClasses} ${COLOR_CLASSES.bgSignupCustom} text-white`;
    }
    return `${getColorClasses.button.secondary} ${baseClasses}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setShowUserDropdown(false);
  };

  const handleStudentLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Redirect to student profile page after successful login
    navigate("/student/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Navigation Header */}
      <nav className="bg-white py-4 lg:py-8 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-16 h-16 md:w-20 md:h-22 flex items-center justify-center">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>
            {/* Right side - Auth buttons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-200"
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className={`${showMobileMenu ? "hidden" : "block"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <svg
                    className={`${showMobileMenu ? "block" : "hidden"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

              {/* Navigation Links */}
              <div className="hidden md:ml-6 lg:ml-10 md:flex md:space-x-4 lg:space-x-8">
                <Link to="/" className={getNavLinkClasses("/")}>
                  Home
                </Link>
                <Link to="/courses" className={getNavLinkClasses("/courses")}>
                  Courses
                </Link>
                <Link to="/about" className={getNavLinkClasses("/about")}>
                  About Us
                </Link>
              </div>
              {isLoggedIn ? (
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Link
                    to="/tutor/signup"
                    className={`${getTutorSignupClasses()} hidden sm:inline-flex px-3 py-1 md:px-6 md:py-1 text-sm md:text-base`}
                  >
                    <span className="hidden lg:inline">Signup as Tutor</span>
                  </Link>
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-1 md:space-x-2 p-1 md:p-2 rounded-full hover:bg-gray-100 transition duration-200"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                        JD
                      </div>
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 text-gray-500 hidden sm:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            John Doe
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            john.doe@example.com
                          </p>
                        </div>
                        <Link
                          to="/student/profile"
                          className={`block px-4 py-2 text-sm transition duration-200 ${
                            isActiveLink("/student/profile")
                              ? `${COLOR_CLASSES.textTertiary} bg-gray-50 font-medium`
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <Link
                    to="/tutor/signup"
                    className={`${getTutorSignupClasses()} hidden  md:inline-flex px-3 py-1 md:px-6 md:py-1 text-sm md:text-base`}
                  >
                    Signup as Tutor
                  </Link>
                  <button
                    onClick={handleStudentLogin}
                    className={`${getColorClasses.button.tertiary} hidden px-3 py-1 md:px-6 md:py-1 rounded-full text-sm md:text-base font-medium transition duration-200 md:block`}
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu as sliding drawer with overlay */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
            showMobileMenu ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-transparent backdrop-blur-sm transition-opacity duration-300 ${
              showMobileMenu ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Drawer */}
          <div
            className={`absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ${
              showMobileMenu ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link
                to="/"
                className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                  isActiveLink("/")
                    ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <HomeFilledIcon className="mr-3" fontSize="medium" /> Home
              </Link>
              <Link
                to="/courses"
                className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                  isActiveLink("/courses")
                    ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <LibraryBooksIcon className="mr-3" fontSize="medium" /> Courses
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                  isActiveLink("/about")
                    ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <ImportContactsIcon className="mr-3" fontSize="medium" /> About
                Us
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/student/profile"
                      className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                        isActiveLink("/student/profile")
                          ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <ContactPageIcon className="mr-3" fontSize="medium" /> My
                      Profile
                    </Link>
                    <Link
                      to="/tutor/signup"
                      className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                        isActiveLink("/tutor/signup")
                          ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <RecentActorsIcon className="mr-3" fontSize="medium" />
                      Signup as Tutor
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition duration-200"
                    >
                      <LogoutIcon className="mr-3" fontSize="medium" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/tutor/signup"
                      className={`block px-3 py-3 rounded-md text-base font-medium transition duration-200 ${
                        isActiveLink("/tutor/signup")
                          ? `${COLOR_CLASSES.textTertiary} bg-purple-50 font-semibold`
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <RecentActorsIcon className="mr-3" fontSize="medium" />{" "}
                      Signup as Tutor
                    </Link>
                    <button
                      onClick={() => {
                        handleStudentLogin();
                        setShowMobileMenu(false);
                      }}
                      className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${COLOR_CLASSES.textTertiary} hover:bg-purple-50 transition duration-200`}
                    >
                      <LoginIcon className="mr-3" fontSize="medium" /> Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Student Login Modal */}
      {showLoginModal && (
        <StudentLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          mode="general"
        />
      )}
    </div>
  );
};

export default StudentLayout;
