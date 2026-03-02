import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Inbox,
  ClipboardCheck,
  AlertCircle,
  Building2,
  Zap,
  Phone,
  TrendingUp,
} from "lucide-react";
import lionIcon from "@/assets/lion-icon.png";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Document Inbox", url: "/documents", icon: Inbox },
  { title: "Ceding Checklist", url: "/ceding", icon: ClipboardCheck },
  { title: "Missing Data", url: "/missing-data", icon: AlertCircle },
  { title: "Provider Directory", url: "/providers", icon: Building2 },
  { title: "Automations", url: "/automations", icon: Zap },
  { title: "Call Assist", url: "/call-assist", icon: Phone },
  { title: "Founder View", url: "/founder", icon: TrendingUp },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-3">
        <img src={lionIcon} alt="Furnley House" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-sidebar-primary-foreground theme-heading">
              FURNLEY HOUSE
            </span>
            <span className="text-[10px] font-medium tracking-widest text-sidebar-primary opacity-80">
              FINANCIAL PLANNING
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
            return (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 theme-sidebar-item px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
      >
        <svg
          className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
