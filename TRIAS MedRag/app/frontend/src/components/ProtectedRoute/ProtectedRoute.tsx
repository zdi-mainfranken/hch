import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../../loginContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = "/" }) => {
    const { loggedIn } = useContext(LoginContext);

    if (!loggedIn) {
        // Redirect to login page if user is not signed in
        return <Navigate to={redirectTo} replace />;
    }

    // If the user is signed in, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
