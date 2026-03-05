import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import DocumentInbox from "./pages/DocumentInbox";
import CedingChecklist from "./pages/CedingChecklist";
import MissingData from "./pages/MissingData";
import ProviderDirectory from "./pages/ProviderDirectory";
import Automations from "./pages/Automations";
import CallAssist from "./pages/CallAssist";
import FounderView from "./pages/FounderView";
import Presentation from "./pages/Presentation";
import LOAWorkflow from "./pages/LOAWorkflow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/documents" element={<DocumentInbox />} />
              <Route path="/ceding" element={<CedingChecklist />} />
              <Route path="/missing-data" element={<MissingData />} />
              <Route path="/providers" element={<ProviderDirectory />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/call-assist" element={<CallAssist />} />
              <Route path="/founder" element={<FounderView />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
