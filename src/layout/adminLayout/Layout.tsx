import Sidebar from "../adminLayout/Sidebar";
import TopBar from "../adminLayout/TopBar";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-full w-full" style={{ background: 'var(--color-bg-light)' }}>
            <Sidebar />
            <div className="ml-[var(--sidebar-width)] min-h-screen flex flex-col">
                <TopBar />
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
