import { Search, Bell, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/services/api";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: getCases });

  const filtered = searchQuery.trim().length >= 2
    ? cases.filter(c => {
        const q = searchQuery.toLowerCase();
        return c.client_name.toLowerCase().includes(q)
          || c.provider_name.toLowerCase().includes(q)
          || c.plan_number.toLowerCase().includes(q)
          || c.case_ref.toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id: string) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/cases/${id}`);
  };

  return (
    <header className="app-header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="relative w-full max-w-md" ref={wrapperRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clients, providers, plan numbers…"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          className="h-10 w-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring theme-btn"
          style={{ borderRadius: 'var(--btn-radius)' }}
        />
        {showResults && searchQuery.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
            {filtered.length > 0 ? (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.client_name}</p>
                    <p className="text-xs text-muted-foreground">{c.provider_name} · {c.plan_number}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.case_ref}</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <button className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" style={{ borderRadius: 'var(--btn-radius)' }}>
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-overdue" />
        </button>
        <div className="flex items-center gap-3 px-3 py-1.5" style={{ borderRadius: 'var(--btn-radius)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">User</p>
            <p className="text-xs text-muted-foreground">CA Team</p>
          </div>
        </div>
      </div>
    </header>
  );
}
