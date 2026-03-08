import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/adminLayout/Layout";
import ClientLayout from "./layout/clientLayout/ClientLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ComingSoon from "./pages/ComingSoon";

import Dashboard from "./pages/adminPanel/Dashboard";
import Clients from "./pages/adminPanel/Clients";
import Users from "./pages/adminPanel/Users";
import Subscriptions from "./pages/adminPanel/Subscription";
import Login from "./login/Login";
import NoAccess from "./pages/NoAccess";
import ClientDashboard from "./pages/clientPanel/ClientDashboard";
import ChatbotConfiguration from "./pages/clientPanel/ChatbotConfiguration";
import TestChatbotPage from "./pages/clientPanel/TestChatbotPage";
import Conversations from "./pages/clientPanel/Conversations";
import WebScraper from "./pages/clientPanel/WebScraper";
import Leads from "./pages/clientPanel/Leads";
import ClientAnalytics from "./pages/clientPanel/Analytics";
import ClientSettings from "./pages/clientPanel/ClientSettings";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/no-access" element={<NoAccess />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Super Admin Routes - Protected with role check */}
        <Route
          path="/SA/*"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<ComingSoon title="Analytics" description="Comprehensive analytics and insights dashboard to track performance metrics." icon="analytics" />} />
          <Route path="users" element={<Users />} />
          <Route path="clients" element={<Clients />} />
          <Route path="chatbots" element={<ComingSoon title="Chatbots" description="Manage and configure your AI chatbots with advanced settings." icon="chatbot" />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="billing" element={<ComingSoon title="Billing & Revenue" description="Track billing information and revenue metrics." icon="billing" />} />
          <Route path="usage" element={<ComingSoon title="Usage" description="Track usage statistics and resource consumption." icon="stats" />} />
          <Route path="integrations" element={<ComingSoon title="Integrations" description="Connect with third-party tools and services to enhance functionality." icon="integrations" />} />
          <Route path="api-management" element={<ComingSoon title="API Management" description="Manage API keys, endpoints, rate limits, and monitor API usage." icon="keys" />} />
          <Route path="settings" element={<ComingSoon title="Settings" description="Configure system preferences and advanced options." icon="settings" />} />
          <Route path="security" element={<ComingSoon title="Activity Logs & Security" description="Monitor activity logs, security events, and manage access controls." icon="security" />} />
          <Route path="support" element={<ComingSoon title="Support Tickets" description="Manage customer support tickets and resolve issues efficiently." icon="support" />} />
          <Route path="active-logs" element={<ComingSoon title="Activity Logs" description="Monitor system activity, user actions, and event logs in real-time." icon="logs" />} />
          <Route path="user-feedback" element={<ComingSoon title="User Feedback" description="Collect, review, and manage user feedback to improve your platform." icon="feedback" />} />
        </Route>

        {/* Client Dashboard Routes - Protected with role check */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="chatbot" element={<ComingSoon title="My Chatbot" description="View and manage your AI chatbot" icon="chatbot" />} />
          <Route path="chatbot-config" element={<ChatbotConfiguration />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="analytics" element={<ClientAnalytics />} />
          <Route path="web-scraper" element={<WebScraper />} />
          <Route path="leads" element={<Leads />} />
          <Route path="test-chatbot" element={<TestChatbotPage />} />
          <Route path="tickets" element={<ComingSoon title="Support Tickets" description="View your support tickets" icon="support" />} />
          <Route path="active-logs" element={<ComingSoon title="Activity Logs" description="View system activity logs" icon="logs" />} />
          <Route path="user-feedback" element={<ComingSoon title="User Feedback" description="View user feedback" icon="feedback" />} />
          <Route path="settings" element={<ClientSettings />} />
          <Route path="api-management" element={<ComingSoon title="API Management" description="Manage your API keys and integration" icon="keys" />} />
          <Route path="integrations" element={<ComingSoon title="Integrations" description="Connect with third-party tools and services" icon="integrations" />} />
          <Route path="security" element={<ComingSoon title="Security" description="Manage security settings and access controls" icon="security" />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
