// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "./components/AppLayout"; // Changed
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PeopleManagementView from "./components/PeopleManagementView";
import BagsManagementView from "./components/BagsManagementView";

const queryClient = new QueryClient();

// A new component to handle the main layout structure
const PageLayout = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<PageLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/people" element={<PeopleManagementView />} />
                <Route path="/bags" element={<BagsManagementView />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;