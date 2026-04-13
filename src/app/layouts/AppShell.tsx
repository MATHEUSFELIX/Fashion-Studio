import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopHeader } from "@/components/navigation/TopHeader";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#211b17] md:flex">
      <Sidebar />
      <div className="studio-texture min-w-0 flex-1">
        <TopHeader />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <main className="glass-panel mx-auto w-full max-w-6xl rounded-xl p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
