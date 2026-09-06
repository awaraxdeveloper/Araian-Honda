import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompany } from "../context/CompanyContext";
import type {
  Employee,
  MonthlySalaryReport,
  AttendanceRecord,
} from "../types/database";

export function SalaryReport() {
  const { selectedCompany } = useCompany();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [reports, setReports] = useState<MonthlySalaryReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const calculateMonthlyReports = async () => {
    if (!selectedCompany) return;
    setLoading(true);

    try {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      // Total days in selected month (e.g. 28, 30, 31)
      const daysInMonth = new Date(year, month, 0).getDate();

      // Start and End date strings for DB query
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-${String(daysInMonth).padStart(
        2,
        "0"
      )}`;

      // 1. Fetch Employees
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", selectedCompany.id)
        .order("name", { ascending: true });

      if (empError) throw empError;

      // 2. Fetch Attendance Records for month
      const { data: attendance, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .eq("company_id", selectedCompany.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (attError) throw attError;

      const attList: AttendanceRecord[] = attendance || [];

      // 3. Compute breakdown per employee
      const calculatedReports: MonthlySalaryReport[] = (employees || []).map(
        (emp: Employee) => {
          const empAtt = attList.filter((a) => a.employee_id === emp.id);

          let fullDays = 0;
          let halfDays = 0;
          let paidHolidays = 0;
          let absentDays = 0;
          let totalOvertimeAmount = 0;

          empAtt.forEach((rec) => {
            if (rec.status === "full") fullDays++;
            else if (rec.status === "half") halfDays++;
            else if (rec.status === "holiday") paidHolidays++;
            else if (rec.status === "absent") absentDays++;

            if (rec.overtime_amount) {
              totalOvertimeAmount += Number(rec.overtime_amount);
            }
          });

          const dailyRate = emp.base_salary / daysInMonth;
          const totalPaidDays = fullDays + halfDays * 0.5 + paidHolidays;
          const totalPay = Math.round(
            totalPaidDays * dailyRate + totalOvertimeAmount
          );

          return {
            employeeId: emp.id,
            employeeName: emp.name,
            baseSalary: emp.base_salary,
            daysInMonth,
            fullDays,
            halfDays,
            paidHolidays,
            extraHolidaysAsAbsent: 0,
            absentDays,
            totalOvertimeAmount,
            totalPaidDays,
            dailyRate: Math.round(dailyRate),
            totalPay,
            balance: totalPay,
          };
        }
      );

      setReports(calculatedReports);
    } catch (err) {
      console.error("Error generating salary report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMonthlyReports();
  }, [selectedCompany, selectedMonth]);

  const totalPayroll = reports.reduce((sum, r) => sum + r.totalPay, 0);

  const exportCSV = () => {
    if (reports.length === 0) return;
    const headers = [
      "Employee Name",
      "Base Salary",
      "Full Days",
      "Half Days",
      "Holidays",
      "Absent Days",
      "Overtime (Rs.)",
      "Total Paid Days",
      "Net Salary (Rs.)",
    ];
    const rows = reports.map((r) => [
      `"${r.employeeName}"`,
      r.baseSalary,
      r.fullDays,
      r.halfDays,
      r.paidHolidays,
      r.absentDays,
      r.totalOvertimeAmount,
      r.totalPaidDays,
      r.totalPay,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Salary_Report_${selectedCompany?.name.replace(
        /\s+/g,
        "_"
      )}_${selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/80 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Monthly Salary & Payroll Report
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automated calculations for{" "}
            <span className="text-red-400 font-semibold">
              {selectedCompany?.name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-white focus:outline-none focus:border-red-500 transition cursor-pointer"
            />
          </div>

          <button
            onClick={exportCSV}
            disabled={reports.length === 0}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold">
              Total Monthly Payroll
            </p>
            <h3 className="text-xl font-black text-white mt-0.5">
              Rs. {totalPayroll.toLocaleString("en-PK")}
            </h3>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold">
              Active Workforce
            </p>
            <h3 className="text-xl font-black text-white mt-0.5">
              {reports.length} Employees
            </h3>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold">
              Avg. Payout per Staff
            </p>
            <h3 className="text-xl font-black text-white mt-0.5">
              Rs.{" "}
              {reports.length > 0
                ? Math.round(totalPayroll / reports.length).toLocaleString(
                    "en-PK"
                  )
                : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-sm">
          Calculating salary records...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800">
          <FileSpreadsheet className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-400">
            No employee records found for this period.
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase font-bold tracking-wider border-b border-neutral-800">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Base Salary</th>
                <th className="px-4 py-4 text-center">Full</th>
                <th className="px-4 py-4 text-center">Half</th>
                <th className="px-4 py-4 text-center">Holiday</th>
                <th className="px-4 py-4 text-center">Absent</th>
                <th className="px-4 py-4 text-right">Overtime</th>
                <th className="px-4 py-4 text-center">Paid Days</th>
                <th className="px-5 py-4 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 font-medium">
              {reports.map((r) => (
                <tr
                  key={r.employeeId}
                  className="hover:bg-neutral-800/40 transition"
                >
                  <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                    {r.employeeName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    Rs. {r.baseSalary.toLocaleString("en-PK")}
                  </td>
                  <td className="px-4 py-4 text-center text-emerald-400">
                    {r.fullDays}
                  </td>
                  <td className="px-4 py-4 text-center text-amber-400">
                    {r.halfDays}
                  </td>
                  <td className="px-4 py-4 text-center text-blue-400">
                    {r.paidHolidays}
                  </td>
                  <td className="px-4 py-4 text-center text-red-400">
                    {r.absentDays}
                  </td>
                  <td className="px-4 py-4 text-right text-purple-400">
                    {r.totalOvertimeAmount > 0
                      ? `+ Rs. ${r.totalOvertimeAmount.toLocaleString("en-PK")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-neutral-200">
                    {r.totalPaidDays} / {r.daysInMonth}
                  </td>
                  <td className="px-5 py-4 text-right font-black text-emerald-400 text-base whitespace-nowrap">
                    Rs. {r.totalPay.toLocaleString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
