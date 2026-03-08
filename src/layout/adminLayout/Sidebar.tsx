// components/Sidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GreetoIcon from "../../assets/GreetoIconWhite.svg";
import Icon from "../../components/Icon";

interface MenuItem {
    label: string;
    path: string;
    icon: string;
    badge?: string;
}

interface NavSection {
    title: string;
    items: MenuItem[];
}

const navSections: NavSection[] = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", path: "/SA/dashboard", icon: "dashboard" },
            { label: "Analytics", path: "/SA/analytics", icon: "analytics" },
        ],
    },
    {
        title: "MANAGE",
        items: [
            { label: "Users", path: "/SA/users", icon: "users" },
            { label: "Clients", path: "/SA/clients", icon: "chatbot" },
            { label: "Subscriptions", path: "/SA/subscriptions", icon: "subscription" },
            { label: "Usage", path: "/SA/usage", icon: "trending" },
        ],
    },
    {
        title: "SYSTEM",
        items: [
            { label: "Settings", path: "/SA/settings", icon: "settings" },
        ],
    },
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userRole } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-[var(--sidebar-width)] h-full bg-[var(--color-bg-dark)] fixed left-0 top-0 z-[100] flex flex-col">
            {/* Logo Section */}
            <div className="px-6 py-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                        <img
                            src={GreetoIcon}
                            alt="Greeto"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                            Greeto
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-[52px]">
                    <span className="text-xs text-[var(--color-text-light)] opacity-60 font-medium">Super Admin</span>
                    <span className="bg-[var(--color-primary)] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        SUPER
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-5">
                {navSections.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        {/* Section Title */}
                        <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-light)] opacity-40 font-semibold px-6 mb-2">
                            {section.title}
                        </div>

                        {/* Section Items */}
                        {section.items.map((item, itemIdx) => (
                            <div
                                key={itemIdx}
                                onClick={() => navigate(item.path)}
                                className={`
                                    flex items-center gap-3 mx-3 px-3 py-2.5 text-[14px] font-medium cursor-pointer
                                    transition-all duration-[var(--transition-fast)] rounded-lg mb-0.5
                                    ${isActive(item.path)
                                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/25"
                                        : "text-white/70 hover:bg-white/8 hover:text-white"
                                    }
                                `}
                            >
                                <Icon
                                    name={item.icon}
                                    size="sm"
                                    decorative
                                    className={isActive(item.path) ? "brightness-0 invert" : "opacity-60"}
                                />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="bg-[var(--color-error)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* User Profile Footer */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors duration-[var(--transition-fast)]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {userRole?.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{userRole?.userName || 'User'}</div>
                        <div className="text-[11px] text-[var(--color-text-light)] opacity-50">{userRole?.role === 'super_admin' ? 'Administrator' : 'Client User'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
