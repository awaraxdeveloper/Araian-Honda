import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./components/AuthView";
import { DailyAttendanceGrid } from "./components/DailyAttendanceGrid";
import { EmployeeManager } from "./components/EmployeeManager";
import { SalaryReport } from "./components/SalaryReport";
import { AdminSidebar } from "./components/AdminSidebar";

type AdminTab = "attendance" | "employees" | "salary";

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("attendance");

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Navbar />
        <AuthView />
      </div>
    );
  }

  if (!currentUser.is_admin) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 flex items-center justify-between">
            <span>
              Manager Portal — Restricted to Daily Attendance Entry
            </span>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">
              No Financial Access
            </span>
          </div>

          <DailyAttendanceGrid />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />

      <div className="flex min-h-[calc(100vh-73px)]">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="min-w-0 flex-1 px-3 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === "attendance"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-900 text-neutral-400"
                }`}
              >
                Daily Attendance
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("employees")}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === "employees"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-900 text-neutral-400"
                }`}
              >
                Employee Directory
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("salary")}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === "salary"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-900 text-neutral-400"
                }`}
              >
                Financial Reports
              </button>
            </div>

            {activeTab === "attendance" && <DailyAttendanceGrid />}
            {activeTab === "employees" && <EmployeeManager />}
            {activeTab === "salary" && <SalaryReport />}
          </div>
        </main>
      </div>
    </div>
  );
}
