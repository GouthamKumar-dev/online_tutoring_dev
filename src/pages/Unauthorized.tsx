import { useLocation, Navigate } from "react-router-dom";
import { COLOR_CLASSES } from "../constants/colors";

const Unauthorized = () => {
  const location = useLocation();
  // If the route is exactly /executive, redirect to /executive/book-requests
  if (
    location.pathname === "/executive" ||
    location.pathname === "/executive/"
  ) {
    return <Navigate to="/executive/book-requests" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          You don't have permission to access this page. Please contact your
          administrator for assistance.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Go Back
          </button>
          <a
            href="/"
            className={`block w-full px-6 py-3 ${COLOR_CLASSES.bgPrimary} text-white rounded-lg ${COLOR_CLASSES.hoverBgPrimary} transition-colors font-medium`}
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
