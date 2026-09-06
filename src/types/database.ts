export type AttendanceStatus = "full" | "half" | "holiday" | "absent";

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  is_admin: boolean;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  base_salary: number;
  created_at?: string;
}

export interface AttendanceRecord {
  id?: string;
  company_id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
  overtime_amount?: number;
  created_at?: string;
}

export interface MonthlySalaryReport {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  daysInMonth: number;
  fullDays: number;
  halfDays: number;
  paidHolidays: number;
  extraHolidaysAsAbsent: number;
  absentDays: number;
  totalOvertimeAmount: number;
  totalPaidDays: number;
  dailyRate: number;
  totalPay: number;
  balance: number;
}
