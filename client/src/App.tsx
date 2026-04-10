import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ConnectionProvider, useConnection } from "./contexts/ConnectionContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyScripts from "./pages/MyScripts";
import ScriptDetail from "./pages/ScriptDetail";
import Market from "./pages/Market";
import MarketDetail from "./pages/MarketDetail";
import Logs from "./pages/Logs";
import LogDetail from "./pages/LogDetail";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { isConnected, isLoading } = useConnection();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">连接中...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <Login />;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/scripts" component={MyScripts} />
          <Route path="/scripts/:id" component={ScriptDetail} />
          <Route path="/market" component={Market} />
          <Route path="/market/:id" component={MarketDetail} />
          <Route path="/logs" component={Logs} />
          <Route path="/logs/:id" component={LogDetail} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'bg-card text-card-foreground border-border text-xs',
            }}
          />
          <ConnectionProvider>
            <AppContent />
          </ConnectionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
