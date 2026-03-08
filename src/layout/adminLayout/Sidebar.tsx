// components/Sidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GreetoIcon from "../../assets/GreetoIconWhite.svg";

interface MenuItem {
    label: string;
    path: string;
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
            { label: "Dashboard", path: "/SA/dashboard" },//has info for the admin about the clients users and all that stuff
            { label: "Analytics", path: "/SA/analytics" },//analytics of all the users and clients
        ],
    },
    {
        title: "MANAGE",
        items: [
            { label: "Users", path: "/SA/users" },
            { label: "Clients", path: "/SA/clients" },
            { label: "Subscriptions", path: "/SA/subscriptions" },
            { label: "Usage", path: "/SA/usage" },//each client's usage, how many messages used, how many leads got, how many conversations and all that stuff
        ],
    },
    // {
    //     title: "SUPPORT",
    //     items: [
    //         { label: "Tickets", path: "/SA/support" },
    //         { label: "Active Logs", path: "/SA/active-logs" },
    //         { label: "User Feedback", path: "/SA/user-feedback" },
    //     ],
    // },
    {
        title: "SYSTEM",
        items: [
            { label: "Settings", path: "/SA/settings" },//system settings for the admin, like changing the theme, changing the colors, changing the font and all that stuff
        ],
    },
];

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userRole } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-[280px] h-full bg-[var(--color-bg-dark)] fixed left-0 top-0 z-[100]">
            {/* Logo Section */}
            <div className="px-6 py-8 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-lg flex items-center justify-center">
                        <img
                            src={GreetoIcon}
                            alt="Greeto"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-white font-heading">
                            Greeto
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-[52px]">
                    <span className="text-xs text-[var(--color-text-light)] opacity-70 font-medium">Super Admin Panel</span>
                    <span className="bg-[var(--color-primary)] text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                        SUPER
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="h-[60%] overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-white/10 ">
                {navSections.map((section, idx) => (
                    <div key={idx} className="mb-8">
                        {/* Section Title */}
                        <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-light)] opacity-50 font-bold px-6 mb-3">
                            {section.title}
                        </div>

                        {/* Section Items */}
                        {section.items.map((item, itemIdx) => (
                            <div
                                key={itemIdx}
                                onClick={() => navigate(item.path)}
                                className={`
                                    flex items-center gap-3 px-6 py-3 text-[15px] font-medium cursor-pointer
                                    transition-all duration-200 relative border-l-3 border-transparent
                                    ${isActive(item.path)
                                        ? "bg-[var(--color-primary)] text-white font-semibold border-l-[var(--color-primary)]"
                                        : "text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10 hover:text-white hover:border-l-[var(--color-primary)]"
                                    }
                                `}
                            >
                                {/* Label */}
                                <span className="flex-1">{item.label}</span>

                                {/* Badge */}
                                {item.badge && (
                                    <span className="ml-auto bg-[var(--color-error)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* User Profile Footer */}
            <div className="px-5 py-5 border-t border-white/10">
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-base">
                        {userRole?.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm text-white">{userRole?.userName || 'User'}</div>
                        <div className="text-xs text-[var(--color-text-light)] opacity-70">{userRole?.role === 'super_admin' ? 'Administrator' : 'Client User'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;