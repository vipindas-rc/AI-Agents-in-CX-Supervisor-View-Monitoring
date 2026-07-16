import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { SupervisorAgents } from "@/pages/SupervisorAgents";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={SupervisorAgents} />
      {/* Digital monitoring: Interaction preview popup / full-page take-over.
          mode is one of preview | expanded | takeover. */}
      <Route
        path="/interactions/:engagementId/:mode"
        component={SupervisorAgents}
      />
      {/* Voice take-over: Active calls view for the taken-over call. */}
      <Route path="/active-call/:agentId" component={SupervisorAgents} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
