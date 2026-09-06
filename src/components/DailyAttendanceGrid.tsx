import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sun,
  XCircle,
  PlusCircle,
  Save,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompany } from "../context/CompanyContext";
import type { Employee, AttendanceStatus } from "../types/database";

interface RecordState {
  employee_id: string;
  status: AttendanceStatus;
  overtime_amount: number;
}

export function DailyAttendanceGrid() {
  const { selectedCompany } = useCompany();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, RecordState>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);

      const { data: empData } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", selectedCompany.id)
        .order("name", { ascending: true });

      const loadedEmps = empData || [];
      setEmployees(loadedEmps);

      const { data: attData } = await supabase
        .from("attendance")
        .select("*")
        .eq("company_id", selectedCompany.id)
        .eq("date", selectedDate);

      const initialMap: Record<string, RecordState> = {};
      loadedEmps.forEach((emp) => {
        const existing = attData?.find((a) => a.employee_id === emp.id);
        initialMap[emp.id] = {
          employee_id: emp.id,
          status: existing ? (existing.status as AttendanceStatus) : "full",
          overtime_amount: existing ? Number(existing.overtime_amount || 0) : 0,
        };
      });

      setAttendanceData(initialMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany, selectedDate]);

  const handleStatus = (empId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], status },
    }));
  };

  const handleOvertime = (empId: string, val: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        overtime_amount: Math.max(0, Number(val) || 0),
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedCompany) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const records = Object.values(attendanceData).map((rec) => ({
        company_id: selectedCompany.id,
        employee_id: rec.employee_id,
        date: selectedDate,
        status: rec.status,
        overtime_amount: rec.overtime_amount,
      }));

      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "employee_id,date" });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-900/90 p-4 sm:p-5 rounded-2xl border border-neutral-800">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
            Daily Attendance Grid
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">
            Marking records for{" "}
            <span className="text-red-400 font-bold">
              {selectedCompany?.name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial min-w-[130px]">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-8 pr-2 text-xs font-bold text-white focus:outline-none focus:border-red-500 transition cursor-pointer"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || employees.length === 0}
            className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-bold text-xs shadow-lg transition shrink-0 ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30"
            }`}
          >
            {saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : saveSuccess ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-xs font-semibold">
          Loading attendance data...
        </div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 text-neutral-400 text-xs font-semibold">
          No employees found in selected company.
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const current = attendanceData[emp.id] || {
              employee_id: emp.id,
              status: "full",
              overtime_amount: 0,
            };

            return (
              <div
                key={emp.id}
                className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 hover:border-neutral-700 transition shadow-md"
              >
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-white truncate">
                    {emp.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-bold">
                    ID: #{emp.id.slice(0, 8)}
                  </p>
                </div>

                {/* Status Toggle Buttons Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full xl:w-auto">
                  <button
                    onClick={() => handleStatus(emp.id, "full")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition ${
                      current.status === "full"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Full
                  </button>

                  <button
                    onClick={() => handleStatus(emp.id, "half")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition ${
                      current.status === "half"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Half
                  </button>

                  <button
                    onClick={() => handleStatus(emp.id, "holiday")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition ${
                      current.status === "holiday"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Holiday
                  </button>

                  <button
                    onClick={() => handleStatus(emp.id, "absent")}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition ${
                      current.status === "absent"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                        : "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Absent
                  </button>
                </div>

                {/* Overtime Input Box */}
                <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
                  <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 shrink-0">
                    <PlusCircle className="w-3.5 h-3.5 text-neutral-500" />{" "}
                    Overtime:
                  </span>
                  <div className="relative flex-1 xl:w-32">
                    <span className="absolute left-2.5 top-2 text-[11px] font-bold text-neutral-500">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={current.overtime_amount || ""}
                      onChange={(e) => handleOvertime(emp.id, e.target.value)}
                      placeholder="0"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 pl-8 pr-2 text-xs font-extrabold text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
