import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute
 * - If not logged in → redirect to /login
 * - If `role` prop is set and user's role doesn't match → redirect to /login
 */
const ProtectedRoute = ({ children, role }) => {
    const { token, role: userRole } = useSelector((state) => state.customer);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
