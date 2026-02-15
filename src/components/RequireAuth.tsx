import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../lib/api";

export const RequireAuth = () => {
    const location = useLocation();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false, // Important: Don't retry if we get a 401
        staleTime: 5 * 60 * 1000, // cache user info
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading session...</p>
            </div>
        );
    }

    // If the API throws an error (401) or returns no user, redirect
    if (isError || !user) {
        // We pass 'state' so we can redirect back after login (optional enhancement)
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the child routes
    return <Outlet />;
};
