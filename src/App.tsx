import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PiggyPopupProvider } from "@/components/PiggyPopup";
import { PiggyEffectsProvider } from "@/components/PiggyEffects";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0faf5' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#006d49' }} />
          <p className="text-sm font-medium" style={{ color: '#596060' }}>Acordando o porquinho... 🐷</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <>
      <OfflineBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <PiggyEffectsProvider>
              <PiggyPopupProvider>
                <AppRoutes />
              </PiggyPopupProvider>
            </PiggyEffectsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
