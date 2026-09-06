import {
  Building2,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { companies, selectedCompany, setSelectedCompany } = useCompany();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/90 border-b border-neutral-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-800 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-red-900/30 border border-red-500/30 shrink-0">
            AH
          </div>
          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
              Araian Honda
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium hidden sm:block truncate">
              Payroll & Management
            </p>
          </div>
        </div>

        {/* Company Selector Pill */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 transition cursor-pointer">
            <Building2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <select
              value={selectedCompany?.id || ""}
              onChange={(e) => {
                const target = companies.find((c) => c.id === e.target.value);
                if (target) setSelectedCompany(target);
              }}
              className="bg-transparent text-xs sm:text-sm font-bold text-neutral-200 focus:outline-none cursor-pointer appearance-none pr-5 max-w-[120px] sm:max-w-[180px] truncate"
            >
              {companies.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-neutral-900 text-white"
                >
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Role Badge & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser.is_admin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Admin:</span>{" "}
              {currentUser.username}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Manager:</span>{" "}
              {currentUser.username}
            </span>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-neutral-800 transition text-xs font-semibold"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
