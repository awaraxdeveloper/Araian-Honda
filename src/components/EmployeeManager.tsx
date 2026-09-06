import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Banknote,
  User,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompany } from "../context/CompanyContext";
import type { Employee } from "../types/database";

export function EmployeeManager() {
  const { selectedCompany } = useCompany();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [nameInput, setNameInput] = useState<string>("");
  const [salaryInput, setSalaryInput] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchEmployees = async () => {
    if (!selectedCompany) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", selectedCompany.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedCompany]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setNameInput("");
    setSalaryInput("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setNameInput(emp.name);
    setSalaryInput(String(emp.base_salary));
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const trimmedName = nameInput.trim();
    const parsedSalary = Number(salaryInput);

    if (!trimmedName) {
      setFormError("Employee name is required.");
      return;
    }
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      setFormError("Please enter a valid base salary.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update({ name: trimmedName, base_salary: parsedSalary })
          .eq("id", editingEmployee.id);

        if (error) throw error;
      } else {
        // Insert new employee
        const { error } = await supabase.from("employees").insert({
          company_id: selectedCompany.id,
          name: trimmedName,
          base_salary: parsedSalary,
        });

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || "Failed to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (
      !confirm(
        `Are you sure you want to delete ${emp.name}? This will remove all their attendance history as well.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", emp.id);

      if (error) throw error;
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Failed to delete employee.");
    }
  };

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/80 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Employee Directory
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage workforce records for{" "}
            <span className="text-red-400 font-semibold">
              {selectedCompany?.name}
            </span>
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employee by name..."
          className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>

      {/* Employee List / Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 text-sm">
          Loading employees...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
          <User className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-400">
            No employees found
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            {searchQuery
              ? "Try matching a different search keyword."
              : 'Click "Add Employee" above to add your first employee.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700/80 transition shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white tracking-wide">
                    {emp.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Banknote className="w-3 h-3" />
                    Rs. {Number(emp.base_salary).toLocaleString("en-PK")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-neutral-800/80">
                <button
                  onClick={() => openEditModal(emp)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEmployee(emp)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingEmployee ? "Edit Employee Details" : "Add New Employee"}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Monthly Base Salary (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="e.g. 35000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? "Saving..." : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
