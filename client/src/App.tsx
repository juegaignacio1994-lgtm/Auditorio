import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CalendarPage from "@/pages/CalendarPage";
import EventsListPage from "@/pages/EventsListPage";
import { EventsProvider } from "@/lib/events-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CalendarPage} />
      <Route path="/events" component={EventsListPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <EventsProvider>
          <Router />
        </EventsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
