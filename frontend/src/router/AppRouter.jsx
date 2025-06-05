import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import Onboarding from "../pages/Onboarding";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import AwsServices from "../pages/AwsServices";
import CostExplorer from "../pages/CostExplorer";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const AppRouter = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if user has access to a specific route based on role
  const hasAccess = (roles) => {
    if (!user || !roles) return false;
    return roles.includes(user.role);
  };

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* User Management - only Admin and Read-Only can access */}
          <Route
            path="/users"
            element={
              hasAccess(["ROLE_ADMIN", "ROLE_READ_ONLY"]) ? (
                <UserManagement />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* more protected routes here */}
          <Route
            path="/onboarding"
            element={
              hasAccess(["ROLE_ADMIN"]) ? (
                <Onboarding />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* AWS Services - Admin, Read-Only, and Customer can access */}
          <Route
            path="/aws-services"
            element={
              hasAccess(["ROLE_ADMIN", "ROLE_READ_ONLY", "ROLE_CUSTOMER"]) ? (
                <AwsServices />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Cost Explorer - Admin, Read-Only, and Customer can access */}
          <Route
            path="/cost-explorer"
            element={
              hasAccess(["ROLE_ADMIN", "ROLE_READ_ONLY", "ROLE_CUSTOMER"]) ? (
                <CostExplorer />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
        </Route>
      </Route>
      {/* Redirect to login if not authenticated, otherwise to dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
