import { useNavigate } from "react-router-dom";
import { useRole, ROLE_LABELS, ROLE_USERS, type Role } from "@/hooks/useRole";
import { ClipboardCheck, UserCheck, FileSearch, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo-dark.png";

const roles: { id: Role; icon: React.ElementType; tagline: string; perms: string[] }[] = [
  {
    id: "ca_team",
    icon: ClipboardCheck,
    tagline: "Chennai · Data Capture",
    perms: ["Upload documents & run AI extraction", "Edit all checklist fields", "Make provider calls & analyse transcripts"],
  },
  {
    id: "paraplanner",
    icon: FileSearch,
    tagline: "UK · Review & Approval",
    perms: ["Review extracted data", "Approve fields or request review", "Comment on cases"],
  },
  {
    id: "adviser",
    icon: UserCheck,
    tagline: "UK · Client Recommendations",
    perms: ["Final case approval", "Edit values (audit-logged)", "Prepare suitability reports"],
  },
  {
    id: "admin",
    icon: ShieldCheck,
    tagline: "Configuration & Users",
    perms: ["Manage users & roles", "Manage Provider Directory", "Manage checklist templates"],
  },
];

const RolePicker = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const pick = (r: Role) => {
    setRole(r);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="app-header h-16 flex items-center px-8 border-b border-border bg-card">
        <img src={logo} alt="Furnley House" className="h-8 w-auto" />
        <div className="ml-4 border-l border-border pl-4">
          <p className="text-sm font-bold theme-heading text-foreground">Ceding Application</p>
          <p className="text-[11px] text-muted-foreground">Furnley House Financial Planning Partners</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Demo · SSO Simulation</p>
            <h1 className="text-3xl font-bold theme-heading text-foreground mb-2">Select your role to continue</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              In production, your role will be detected automatically via SSO. For this prototype, choose the role you'd like to experience.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => pick(r.id)}
                className="theme-card theme-card-accent border border-border bg-card text-left transition-all hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 mb-4" style={{ borderRadius: "var(--btn-radius)" }}>
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold theme-heading text-foreground mb-0.5">{ROLE_LABELS[r.id]}</h3>
                <p className="text-[11px] text-muted-foreground mb-3">{r.tagline}</p>
                <p className="text-xs text-foreground font-medium mb-3 pb-3 border-b border-border">
                  Sign in as <span className="text-primary">{ROLE_USERS[r.id]}</span>
                </p>
                <ul className="space-y-1.5">
                  {r.perms.map((p) => (
                    <li key={p} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                  Continue as {ROLE_LABELS[r.id]} →
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card px-8 py-3 text-center text-[11px] text-muted-foreground">
        Data retained for 12 months per FH policy · Prototype build · © Furnley House Financial Planning Partners
      </footer>
    </div>
  );
};

export default RolePicker;
