import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import PublicRoute from "../utils/PublicRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CategoryManager from "../pages/admin/CategoryManager";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../utils/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import AuthLoader from "../features/auth/AuthLoader";
import BookRequests from "../pages/admin/BookRequests";
import Logs from "../pages/admin/Logs";
import AppUpdates from "../pages/admin/AppUpdates";
import TutorRequests from "../pages/admin/TutorRequests";
import ExecutiveLayout from "../layouts/ExecutiveLayout";
import Staffs from "../pages/admin/Staffs";
import HomePage from "../pages/student/HomePage";
import CoursesPage from "../pages/student/CoursesPage";
import StudentProfile from "../pages/student/StudentProfile";
import TutorSignupPage from "../pages/tutor/TutorSignupPage";
import CourseBooking from "../pages/student/CourseBooking";
import AboutUs from "../pages/AboutUs";

const AppRoutes = () => (
  <Routes>
    {/* Public Student Routes */}
    <Route
      path="/"
      element={
        <StudentLayout>
          <HomePage />
        </StudentLayout>
      }
    />
    <Route
      path="/courses"
      element={
        <StudentLayout>
          <CoursesPage />
        </StudentLayout>
      }
    />
    <Route
      path="/about"
      element={
        <StudentLayout>
          <AboutUs />
        </StudentLayout>
      }
    />
    <Route
      path="/student/profile"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <StudentProfile />
            </StudentLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />
    <Route
      path="/course/:courseId/book"
      element={
        <StudentLayout>
          <CourseBooking />
        </StudentLayout>
      }
    />

    {/* Tutor Routes */}
    <Route
      path="/tutor/signup"
      element={
        <StudentLayout>
          <TutorSignupPage />
        </StudentLayout>
      }
    />

    {/* Admin/Executive Login */}
    <Route
      path="/login"
      element={
        <AuthLoader>
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        </AuthLoader>
      }
    />

    {/* Admin Routes */}
    <Route
      path="/admin"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />

    <Route
      path="/admin/book-requests"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <BookRequests />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />

    <Route
      path="/admin/courses"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <CategoryManager />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />
    <Route
      path="/admin/staff"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Staffs />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />

    <Route
      path="/admin/logs"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <Logs />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />
    <Route
      path="/admin/app-updates"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AppUpdates />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />
    <Route
      path="/admin/tutor-requests"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <TutorRequests />
            </AdminLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />

    {/* Executive Routes */}
    <Route
      path="/executive/book-requests"
      element={
        <AuthLoader>
          <ProtectedRoute allowedRoles={["executive"]}>
            <ExecutiveLayout>
              <BookRequests />
            </ExecutiveLayout>
          </ProtectedRoute>
        </AuthLoader>
      }
    />

    <Route path="*" element={<Unauthorized />} />
  </Routes>
);

export default AppRoutes;
