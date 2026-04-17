import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { RoleProvider } from "@/hooks/useRole";
import { RoleGuard } from "@/components/RoleGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import RolePicker from "./pages/RolePicker";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import ProviderDirectory from "./pages/ProviderDirectory";
import Admin from "./pages/Admin";
import Presentation from "./pages/Presentation";
import LOAWorkflow from "./pages/LOAWorkflow";
import AuditTrail from "./pages/AuditTrail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RoleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RolePicker />} />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="/loa-workflow" element={<LOAWorkflow />} />
              <Route
                element={
                  <RoleGuard>
                    <AppLayout />
                  </RoleGuard>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/providers" element={<ProviderDirectory />} />
                <Route
                  path="/audit"
                  element={
                    <RoleGuard allow={["admin", "paraplanner", "adviser"]}>
                      <AuditTrail />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RoleGuard allow={["admin"]}>
                      <Admin />
                    </RoleGuard>
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RoleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
