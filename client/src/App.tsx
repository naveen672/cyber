import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ThreatDashboard from "@/pages/ThreatDashboard";
import DosDetectionPage from "@/pages/DosDetectionPage";
import EmailInboxPage from "@/pages/EmailInboxPage";
import BruteForceDetectionPage from "@/pages/BruteForceDetectionPage";
import WebsiteBlockerPage from "@/pages/WebsiteBlockerPage";
import SettingsPage from "@/pages/SettingsPage";
import { useEffect, useState } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    setIsLoading(false);
    
    // Redirect to login if not authenticated and not already on login page
    if (authStatus !== 'true' && location !== '/') {
      setLocation('/');
    }
    
    // Redirect to dashboard if authenticated and on login page
    if (authStatus === 'true' && location === '/') {
      setLocation('/dashboard');
    }
  }, [location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading CyberShield AI...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      <Route path="/dashboard">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      <Route path="/threat-center">
        {isAuthenticated ? <ThreatDashboard /> : <Login />}
      </Route>
      <Route path="/dos-detection">
        {isAuthenticated ? <DosDetectionPage /> : <Login />}
      </Route>
      <Route path="/email-inbox">
        {isAuthenticated ? <EmailInboxPage /> : <Login />}
      </Route>
      <Route path="/brute-force-detection">
        {isAuthenticated ? <BruteForceDetectionPage /> : <Login />}
      </Route>
      <Route path="/website-blocker">
        {isAuthenticated ? <WebsiteBlockerPage /> : <Login />}
      </Route>
      <Route path="/settings">
        {isAuthenticated ? <SettingsPage /> : <Login />}
      </Route>
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
