import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import { LoginPage } from "./pages/Login";
import { RequireAuth } from "./components/RequireAuth"; // Import the new component
import VehicleProfile from "./pages/VehicleProfile";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes - specific paths nested inside RequireAuth */}
                    <Route element={<RequireAuth />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/notes" element={<VehicleProfile />} />
                        {/* Add other protected pages here */}
                    </Route>

                    {/* Catch-all - can be public or protected depending on preference */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
