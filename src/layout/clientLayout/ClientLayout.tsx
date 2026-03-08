import ClientSidebar from "./ClientSidebar";
import TopBar from "../../components/TopBar";
import { Outlet } from "react-router-dom";

const clientNavItems = [
  { label: "Dashboard", path: "/client/dashboard", icon: "dashboard" },
  { label: "Analytics", path: "/client/analytics", icon: "analytics" },
  { label: "Chatbot Config", path: "/client/chatbot-config", icon: "settings" },
  { label: "Web Scraper", path: "/client/web-scraper", icon: "search" },
  { label: "Conversations", path: "/client/conversations", icon: "chat" },
  { label: "Leads", path: "/client/leads", icon: "users" },
  { label: "Test Chatbot", path: "/client/test-chatbot", icon: "chatbot" },
  { label: "My Subscription", path: "/client/my-subscription", icon: "subscription" },
  { label: "Settings", path: "/client/settings", icon: "settings" },
];

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-full" style={{ background: 'var(--color-bg-light)' }}>
      <ClientSidebar />
      <div className="ml-[var(--sidebar-width)] min-h-screen flex flex-col">
        <TopBar panelLabel="Client" basePath="/client/dashboard" navItems={clientNavItems} />
        <main className="px-8 py-6 flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
