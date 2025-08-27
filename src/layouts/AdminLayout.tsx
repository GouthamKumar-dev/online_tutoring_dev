import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { COLOR_CLASSES } from "../constants/colors";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import baseAxios from "../features/auth/baseAxios";
import toast, { Toaster } from "react-hot-toast";

const navItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon className="mr-3" fontSize="medium" />,
    to: "/admin",
    exact: true,
  },
  {
    label: "Book Requests",
    icon: <MenuBookIcon className="mr-3" fontSize="medium" />,
    to: "/admin/book-requests",
    badge: 3,
  },
  {
    label: "Courses",
    icon: <LibraryBooksIcon className="mr-3" fontSize="medium" />,
    to: "/admin/courses",
  },
  {
    label: "Staff",
    icon: <PeopleIcon className="mr-3" fontSize="medium" />,
    to: "/admin/staff",
  },
  {
    label: "Tutor Requests",
    icon: <SchoolIcon className="mr-3" fontSize="medium" />,
    to: "/admin/tutor-requests",
  },
  {
    label: "Logs",
    icon: <AssignmentIcon className="mr-3" fontSize="medium" />,
    to: "/admin/logs",
  },
  {
    label: "App Updates",
    icon: <NotificationsIcon className="mr-3" fontSize="medium" />,
    to: "/admin/app-updates",
  },
  {
    label: "Logout",
    icon: <ExitToAppIcon className="mr-3" fontSize="medium" />,
    to: "/logout",
  },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  interface LogoutEvent
    extends React.MouseEvent<HTMLAnchorElement, MouseEvent> {}

  const handleLogout = async (e: LogoutEvent): Promise<void> => {
    e.preventDefault();
    try {
      await baseAxios.post("/auth/logout"); // Optional: clear backend session/cookie
      navigate("/login", { replace: true });
      setTimeout(() => {
        dispatch(logout());
        localStorage.clear();
        sessionStorage.clear();
      }, 100); // Delay to allow navigation before clearing auth
    } catch {
      // Handle error
      console.error("Logout failed");
      toast.error("Logout failed");
    }
  };

  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex bg-gray-50 overflow-hidden min-h-screen">
      {/* Sidebar */}
      <aside
        className={`relative bg-white border-r border-gray-200 flex flex-col py-6 transition-all duration-500 ease-in-out ${
          collapsed ? "w-[80px]" : "w-[240px]"
        }`}
        style={{
          minWidth: collapsed ? 80 : 240,
          maxWidth: collapsed ? 80 : 240,
        }}
      >
        <button
          className={`absolute top-6 right-0 translate-x-1/2 ${COLOR_CLASSES.bgPrimary} text-white rounded-full shadow-lg w-8 h-8 flex items-center justify-center focus:outline-none z-10 transition-all duration-300 hover:cursor-pointer`}
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{ transition: "right 0.3s" }}
        >
          {collapsed ? (
            <ChevronRightIcon fontSize="medium" />
          ) : (
            <ChevronLeftIcon fontSize="medium" />
          )}
        </button>
        <div
          className={`font-bold px-6 mb-8 text-2xl transition-all duration-100 ${
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          }`}
        >
          Admin
        </div>
        <ul className="flex-1 space-y-1">
          {navItems.map((item) => (
            <li className="w-full" key={item.label}>
              {item.label === "Logout" ? (
                <a
                  href="#"
                  className={`flex items-center py-3 text-gray-700 hover:${
                    COLOR_CLASSES.bgSecondary
                  }/20 cursor-pointer rounded-r-full transition font-semibold px-2 ${
                    collapsed ? "justify-center" : "px-6"
                  }`}
                  onClick={handleLogout}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    [
                      `flex items-center py-3 text-gray-700 hover:bg-violet-100 cursor-pointer rounded-r-full transition font-semibold px-2 ${
                        collapsed ? "justify-center" : "px-6"
                      }`,
                      isActive ? "text-violet-600 bg-violet-50" : "",
                    ].join(" ")
                  }
                >
                  {item.icon}
                  {!collapsed && item.label}
                  {item.badge && !collapsed && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        <div
          className={`mt-auto py-4 bg-gray-50 border-t border-gray-200 px-2 transition-all duration-300 ${
            collapsed ? "opacity-0 w-0" : "opacity-100 px-6 w-auto"
          }`}
        >
          <div className="font-semibold text-sm">Online Tutoring</div>
          <div className="text-xs text-gray-400">Version: 1.0.0.11</div>
        </div>
      </aside>
      {/* Main Content */}
      <main
        className="flex-1"
        style={{
          minWidth: 0,
        }}
      >
        {/* Topbar notification icon */}
        <div className="flex items-center justify-end px-8 py-8 bg-white border-b border-gray-200"></div>
        <div className="bg-gray-50">{children}</div>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

export default AdminLayout;
