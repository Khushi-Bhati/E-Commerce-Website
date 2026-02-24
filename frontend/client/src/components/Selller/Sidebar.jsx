import React, { useState } from "react";
import "./../styles/Seller/Dasbaord.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../reducers/Reducers.js";
import API from "../../config/api.js";
import Swal from "sweetalert2";

const Sidebar = ({ isOpen, onOpen, onClose, showMenuButton = true }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = typeof isOpen === "boolean";
    const isSidebarOpen = isControlled ? isOpen : internalOpen;

    const handleOpen = () => {
        if (typeof onOpen === "function") {
            onOpen();
        }
        if (!isControlled) {
            setInternalOpen(true);
        }
    };

    const handleClose = () => {
        if (typeof onClose === "function") {
            onClose();
        }
        if (!isControlled) {
            setInternalOpen(false);
        }
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = async (e) => {
        e.preventDefault();
        handleClose();
        try {
            await API.post("/user/logout");
        } catch (_) { /* ignore */ }
        dispatch(logout());
        Swal.fire({ icon: 'success', title: 'Signed out', timer: 1200, showConfirmButton: false });
        navigate('/login');
    };

    const navItems = [
        { to: "/seller/dashboard", icon: "grid_view", label: "Dashboard" },
        { to: "/seller/productlist", icon: "inventory_2", label: "Products" },
        { to: "/seller/addproduct", icon: "add_box", label: "Add Product" },
        { to: "/seller/orders", icon: "shopping_bag", label: "Orders" },
        { to: "/seller/customers", icon: "groups", label: "Customers" },
        { to: "/seller/payments", icon: "payments", label: "Payments" },
        { to: "/seller/analytics", icon: "insights", label: "Analytics" },
        { to: "/seller/reviews", icon: "reviews", label: "Reviews" },
        { to: "/seller/settings", icon: "settings", label: "Settings" },
    ];

    return (
        <>
            {showMenuButton && (
                <button
                    type="button"
                    className={`dashboard-menu-btn seller-mobile-menu-btn ${isSidebarOpen ? "is-hidden" : ""}`}
                    aria-label="Open sidebar menu"
                    aria-expanded={isSidebarOpen}
                    onClick={handleOpen}
                >
                    <span className="material-symbols-sharp">menu</span>
                </button>
            )}

            {!isControlled && (
                <div
                    className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
                    onClick={handleClose}
                    aria-hidden="true"
                />
            )}

            <aside className={isSidebarOpen ? "sidebar-open" : ""}>
                <div className="top">
                    <div className="logo">
                        <h2>Easein<span className="danger">Cart</span></h2>
                    </div>
                    <div className="close" id="close_btn" onClick={handleClose} role="button" aria-label="Close sidebar">
                        <span className="material-symbols-sharp">close</span>
                    </div>
                </div>

                <div className="sidebar">
                    {navItems.map(({ to, icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={isActive(to)}
                            onClick={handleClose}
                            title={label}
                        >
                            <span className="material-symbols-sharp">{icon}</span>
                            <h3>{label}</h3>
                        </Link>
                    ))}

                    <a href="#" onClick={handleLogout} title="Logout">
                        <span className="material-symbols-sharp">logout</span>
                        <h3>Logout</h3>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
