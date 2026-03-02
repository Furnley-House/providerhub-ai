import { useTheme, ThemeName } from "@/hooks/useTheme";
import { Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const themes: { name: ThemeName; label: string; colors: [string, string, string] }[] = [
  { name: "ocean", label: "Ocean", colors: ["hsl(220,40%,13%)", "hsl(187,70%,38%)", "hsl(210,20%,98%)"] },
  { name: "furnley", label: "Furnley", colors: ["hsl(220,38%,15%)", "hsl(38,85%,48%)", "hsl(40,30%,97%)"] },
  { name: "forest", label: "Forest", colors: ["hsl(150,35%,13%)", "hsl(152,65%,36%)", "hsl(140,20%,97%)"] },
  { name: "royal", label: "Royal", colors: ["hsl(262,40%,14%)", "hsl(262,60%,50%)", "hsl(260,20%,97%)"] },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Switch theme"
      >
        <Palette className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-50 p-2">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</p>
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => { setTheme(t.name); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                theme === t.name ? "bg-accent text-accent-foreground font-medium" : "text-foreground hover:bg-muted"
              }`}
            >
              <div className="flex gap-0.5">
                {t.colors.map((c, i) => (
                  <div key={i} className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                ))}
              </div>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
