import Sidebar from "./Sidebar";
import TopBar from "../../components/TopBar";
import { Outlet } from "react-router-dom";

const adminNavItems = [
  { label: "Dashboard", path: "/SA/dashboard", icon: "dashboard" },
  { label: "Analytics", path: "/SA/analytics", icon: "analytics" },
  { label: "Users", path: "/SA/users", icon: "users" },
  { label: "Clients", path: "/SA/clients", icon: "chatbot" },
  { label: "Subscriptions", path: "/SA/subscriptions", icon: "subscription" },
  { label: "Usage", path: "/SA/usage", icon: "trending" },
  { label: "Settings", path: "/SA/settings", icon: "settings" },
];

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-full w-full" style={{ background: 'var(--color-bg-light)' }}>
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] min-h-screen flex flex-col">
        <TopBar panelLabel="Admin" basePath="/SA/dashboard" navItems={adminNavItems} />
        <main className="px-8 py-6 flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
