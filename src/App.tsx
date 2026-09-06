import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthView } from "./components/AuthView";
import { DailyAttendanceGrid } from "./components/DailyAttendanceGrid";
import { EmployeeManager } from "./components/EmployeeManager";
import { SalaryReport } from "./components/SalaryReport";
import { Calendar, Users, FileText } from "lucide-react";

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "attendance" | "employees" | "salary"
  >("attendance");

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Navbar />
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Bar for Admin */}
        {currentUser.is_admin ? (
          <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === "attendance"
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily Attendance
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === "employees"
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Users className="w-4 h-4" />
              Employee Directory
            </button>

            <button
              onClick={() => setActiveTab("salary")}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === "salary"
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              Financial Reports
            </button>
          </div>
        ) : (
          /* Manager Banner */
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 flex items-center justify-between">
            <span>Manager Portal — Restricted to Daily Attendance Entry</span>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">
              No Financial Access
            </span>
          </div>
        )}

        {/* Dynamic Screen View */}
        {currentUser.is_admin ? (
          <>
            {activeTab === "attendance" && <DailyAttendanceGrid />}
            {activeTab === "employees" && <EmployeeManager />}
            {activeTab === "salary" && <SalaryReport />}
          </>
        ) : (
          <DailyAttendanceGrid />
        )}
      </main>
    </div>
  );
}
