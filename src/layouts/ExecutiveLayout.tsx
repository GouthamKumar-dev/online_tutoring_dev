import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import baseAxios from "../features/auth/baseAxios";

const navItems = [
  {
    label: "Book Requests",
    icon: <MenuBookIcon className="mr-3" fontSize="medium" />,
    to: "/executive/book-requests",
    badge: 3,
    exact: true,
  },

  {
    label: "Logout",
    icon: <ExitToAppIcon className="mr-3" fontSize="medium" />,
    to: "/logout",
  },
];

const ExecutiveLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  interface LogoutEvent
    extends React.MouseEvent<HTMLAnchorElement, MouseEvent> {}

  const handleLogout = async (e: LogoutEvent): Promise<void> => {
    e.preventDefault();
    try {
      await baseAxios.post("/api/logout"); // Optional: clear backend session/cookie
    } catch {}
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        className={`relative bg-white border-r border-gray-200 flex flex-col py-6 transition-all duration-500 ease-in-out ${
          collapsed ? "w-[80px]" : "w-[240px]"
        }`}
        style={{
          minWidth: collapsed ? 80 : 240,
          maxWidth: collapsed ? 80 : 240,
        }}
        initial={shouldReduceMotion ? undefined : { x: -10, opacity: 0 }}
        animate={shouldReduceMotion ? undefined : { x: 0, opacity: 1 }}
        transition={{ duration: 0.36 }}
      >
        <motion.button
          className="absolute top-6 right-0 translate-x-1/2 bg-violet-600 text-white rounded-full shadow-lg w-8 h-8 flex items-center justify-center focus:outline-none z-10 transition-all duration-300 hover:cursor-pointer"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{ transition: "right 0.3s" }}
          animate={collapsed ? { rotate: 0 } : { rotate: 180 }}
          transition={{ duration: 0.28 }}
        >
          {collapsed ? (
            <ChevronRightIcon fontSize="medium" />
          ) : (
            <ChevronLeftIcon fontSize="medium" />
          )}
        </motion.button>
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.14 }}
          className={`font-bold px-6 mb-8 text-2xl transition-all duration-100 ${
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          }`}
        >
          Executive
        </motion.div>
        <ul className="flex-1 space-y-1">
          {navItems.map((item) => (
            <li className="w-full" key={item.label}>
              {item.label === "Logout" ? (
                <a
                  href="#"
                  className={`flex items-center py-3 text-gray-700 hover:bg-violet-100 cursor-pointer rounded-r-full transition font-semibold px-2 ${
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
      </motion.aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar notification icon */}
        <div className="flex items-center justify-end px-8 py-8 bg-white border-b border-gray-200"></div>
        <div className="flex-1 p-8 bg-gray-50">{children}</div>
      </main>
    </div>
  );
};

export default ExecutiveLayout;
