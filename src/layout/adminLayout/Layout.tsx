import Sidebar from "../adminLayout/Sidebar";
import TopBar from "../adminLayout/TopBar";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-full w-full bg-light">
            <Sidebar />

            <div className="ml-[280px] min-h-screen flex flex-col">
                <TopBar />
                <main className="bg-[var(--color-bg-light)] px-7 py-6 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;