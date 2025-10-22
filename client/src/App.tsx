import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import BusesPage from "@/pages/buses";
import StationsPage from "@/pages/stations";
import AlertsPage from "@/pages/alerts";
import SettingsPage from "@/pages/settings";
import VideoMonitorPage from "@/pages/video-monitor";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/buses" component={BusesPage} />
        <Route path="/stations" component={StationsPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/video" component={VideoMonitorPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
