import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import logo from "@/assets/logo-white.png";

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { isAdmin } = useRole();

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, show: true },
    { title: "Cases", url: "/cases", icon: Briefcase, show: true },
    { title: "Provider Directory", url: "/providers", icon: Building2, show: true },
    { title: "Admin Panel", url: "/admin", icon: ShieldCheck, show: isAdmin },
  ].filter((i) => i.show);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-accent shrink-0">
          <img src={logo} alt="FH" className="h-7 w-7 object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-bold tracking-tight text-sidebar-accent-foreground theme-heading truncate">
              FURNLEY HOUSE
            </span>
            <span className="text-[9px] font-medium tracking-widest text-sidebar-primary truncate">
              CEDING APPLICATION
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
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

      {!collapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/60 leading-relaxed">
          Data retained for 12 months per FH policy
        </div>
      )}

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
