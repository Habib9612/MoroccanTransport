import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import LandingPage from "@/pages/LandingPage";
import { useUser } from "@/hooks/use-user";
import Navbar from "@/components/layout/navbar";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useUser();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" role="progressbar" aria-label="Loading" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/register" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;