import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { clientApi } from "../../api";
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

interface SubscriptionData {
    plan: string;
    status: string;
    is_trial: boolean;
}

const navSections: NavSection[] = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", path: "/client/dashboard" },//has info of everything related to that client - like client activity, how many leads we got and everything like that
            { label: "Analytics", path: "/client/analytics" },//analytics of chatbot performance, like how many conversations, how many leads, how many active users and all that stuff
        ],
    },
    {
        title: "MANAGE",
        items: [
            { label: "Chatbot Configuration", path: "/client/chatbot-config" },
            { label: "Web Scraper", path: "/client/web-scraper" },
            { label: "Conversations", path: "/client/conversations" },
            { label: "Leads", path: "/client/leads" },
            { label: "Test Chatbot", path: "/client/test-chatbot" },
            { label: "My subscription", path: "/client/my-subscription" },//can see the details of his subscription, like when it expires, what plan is he on and also before expiration can update the plan.
        ],
    },
    // {
    //     title: "SUPPORT",
    //     items: [
    //         { label: "Tickets", path: "/client/tickets" },
    //         { label: "Active Logs", path: "/client/active-logs" },
    //         { label: "User Feedback", path: "/client/user-feedback" },
    //     ],
    // },
    {
        title: "SYSTEM",
        items: [
            { label: "Settings", path: "/client/settings" },//client can change his account settings, like changing the theme, changing the colors, changing the font and all that stuff
            // { label: "Integrations", path: "/client/integrations" },//integrating with teams, slack, whatsapp
        ],
    },
];

export default function ClientSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userRole } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            const response = await clientApi.getClientProfile();
            if (response.subscription) {
                setSubscription({
                    plan: response.subscription.plan,
                    status: response.subscription.status,
                    is_trial: response.subscription.is_trial,
                });
            }
        } catch (err) {
            console.error('Error fetching subscription data:', err);
        }
    };
    const getSubscriptionBadgeColor = (plan: string) => {
        switch (plan?.toLowerCase()) {
            case 'professional':
                return 'bg-[var(--color-primary)]';
            case 'business':
                return 'bg-[var(--color-success)]';
            case 'enterprise':
                return 'bg-[var(--color-warning)]';
            default:
                return 'bg-[var(--color-primary)]';
        }
    };

    const getShortPlanName = (plan: string) => {
        switch (plan?.toLowerCase()) {
            case 'professional':
                return 'PRO';
            case 'business':
                return 'BIZ';
            case 'enterprise':
                return 'ENT';
            default:
                return 'PLAN';
        }
    };

    const formatPlanName = (plan: string, isTrial: boolean) => {
        const shortName = getShortPlanName(plan);
        return isTrial ? `${shortName} • TRIAL` : shortName;
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-[280px] h-full bg-[var(--color-bg-dark)] fixed left-0 top-0 z-[100]">
            {/* Logo Section */}
            <div className="px-6 py-8 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-lg flex items-center justify-center">
                        <img src={GreetoIcon} alt="Greeto" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xl font-extrabold text-white font-heading">
                            Greeto AI
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-[52px]">
                    <span className="text-xs text-[var(--color-text-light)] opacity-70 font-medium">Client Admin Panel</span>
                    <span className={`${getSubscriptionBadgeColor(subscription?.plan || '')} text-white text-[8px] px-2.5 py-1.5 rounded-md font-bold tracking-wider shadow-md whitespace-nowrap`}>
                        {subscription ? formatPlanName(subscription.plan, subscription.is_trial) : 'LOADING'}
                    </span>
                </div>
            </div>
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
    )
}