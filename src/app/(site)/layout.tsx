import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen overflow-x-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <div className="flex h-full bg-[#f4f5f9]">{children}</div>
            </div>
        </div>
    );
}
