import React from "react";
import "./../styles/Seller/Dasbaord.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../reducers/Reducers.js";
import API from "../../config/api.js";
import Swal from "sweetalert2";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const closeSidebar = () => {
        const aside = document.querySelector('.main-wrapper aside');
        const overlay = document.querySelector('.sidebar-overlay');
        if (aside) aside.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('active');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = async (e) => {
        e.preventDefault();
        closeSidebar();
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
        <aside>
            <div className="top">
                <div className="logo">
                    <h2>Easein<span className="danger">Cart</span></h2>
                </div>
                <div className="close" id="close_btn" onClick={closeSidebar} role="button" aria-label="Close sidebar">
                    <span className="material-symbols-sharp">close</span>
                </div>
            </div>

            <div className="sidebar">
                {navItems.map(({ to, icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        className={isActive(to)}
                        onClick={closeSidebar}
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
    );
};

export default Sidebar;
