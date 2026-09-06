import type { MonthlySalaryReport, AttendanceStatus } from "../types/database";

/**
 * Helper to get the total days in a given month.
 * @param month Index of month (0 = January, 11 = December)
 * @param year Full year (e.g. 2026)
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format month and year into a DB key string (e.g. "2026-09")
 */
export function formatMonthYearKey(year: number, month: number): string {
  const formattedMonth = String(month + 1).padStart(2, "0");
  return `${year}-${formattedMonth}`;
}

/**
 * Calculate full salary report breakdown for an individual employee based on daily records.
 */
export function calculateDailyBasedSalary(
  employeeId: string,
  employeeName: string,
  baseSalary: number,
  month: number,
  year: number,
  attendanceRecords: Record<string, AttendanceStatus> // key: date string "YYYY-MM-DD", value: status
): MonthlySalaryReport {
  const daysInMonth = getDaysInMonth(month, year);
  let fullDays = 0;
  let halfDays = 0;
  let rawHolidays = 0;
  let rawAbsents = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const status = attendanceRecords[dateStr] || "absent";

    if (status === "full") {
      fullDays++;
    } else if (status === "half") {
      halfDays++;
    } else if (status === "holiday") {
      rawHolidays++;
    } else {
      rawAbsents++;
    }
  }

  // Business Logic Rules: Maximum 4 Paid Holidays allowed per month
  const paidHolidays = Math.min(rawHolidays, 4);
  const extraHolidaysAsAbsent = Math.max(rawHolidays - 4, 0);
  const absentDays = rawAbsents + extraHolidaysAsAbsent;

  const totalPaidDays = fullDays + halfDays * 0.5 + paidHolidays;
  const dailyRate = baseSalary / daysInMonth;
  const totalPay = Math.min(dailyRate * totalPaidDays, baseSalary);
  const balance = baseSalary - totalPay;

  return {
    employeeId,
    employeeName,
    baseSalary,
    daysInMonth,
    fullDays,
    halfDays,
    paidHolidays,
    extraHolidaysAsAbsent,
    absentDays,
    totalPaidDays,
    dailyRate,
    totalPay,
    balance,
  };
}

/**
 * Calculate salary report breakdown for an individual employee based on bulk working days entry.
 */
export function calculateBulkBasedSalary(
  employeeId: string,
  employeeName: string,
  baseSalary: number,
  month: number,
  year: number,
  workingDays: number
): MonthlySalaryReport {
  const daysInMonth = getDaysInMonth(month, year);
  const validWorkingDays = Math.min(Math.max(workingDays, 0), daysInMonth);
  const absentDays = daysInMonth - validWorkingDays;
  const dailyRate = baseSalary / daysInMonth;
  const totalPay = Math.min(dailyRate * validWorkingDays, baseSalary);
  const balance = baseSalary - totalPay;

  return {
    employeeId,
    employeeName,
    baseSalary,
    daysInMonth,
    fullDays: validWorkingDays,
    halfDays: 0,
    paidHolidays: 0,
    extraHolidaysAsAbsent: 0,
    absentDays,
    totalPaidDays: validWorkingDays,
    dailyRate,
    totalPay,
    balance,
  };
}
