import ClientSidebar from "./ClientSidebar";
import ClientHeder from "./ClientHeder";
import { Outlet } from "react-router-dom";

const ClientLayout: React.FC = () => {
    return (
        <div className="min-h-full" style={{ background: 'var(--color-bg-light)' }}>
            <ClientSidebar />
            <div className="ml-[var(--sidebar-width)] min-h-screen flex flex-col">
                <ClientHeder />
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
