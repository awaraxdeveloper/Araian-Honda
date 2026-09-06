import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
} from "lucide-react";

type AdminTab = "attendance" | "employees" | "salary";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    {
      id: "attendance" as const,
      label: "Daily Attendance",
      icon: CalendarDays,
    },
    {
      id: "employees" as const,
      label: "Employee Directory",
      icon: Users,
    },
    {
      id: "salary" as const,
      label: "Financial Reports",
      icon: FileText,
    },
  ];

  return (
    <aside
      className={`hidden lg:flex h-[calc(100vh-73px)] sticky top-[73px] shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
        {!collapsed && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
              Admin Panel
            </p>
            <p className="mt-1 text-sm font-bold text-white">Management</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-3">
        {!collapsed && (
          <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-600">
            Navigation
          </p>
        )}

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group flex w-full items-center rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              } ${collapsed ? "justify-center" : "gap-3"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-neutral-900/70 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Access Level
            </p>
            <p className="mt-1 text-xs font-bold text-red-400">
              Administrator
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </aside>
  );
}
