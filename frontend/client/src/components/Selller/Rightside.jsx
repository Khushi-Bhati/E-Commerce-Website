import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import "./../styles/Seller/Dasbaord.css";
import API from '../../config/api.js';
import { sellerprofiledata } from '../../reducers/Reducers.js';

import profile1 from "./../../images/profile-1.jpg";
import profile2 from "./../../images/profile-2.jpg";
import profile3 from "./../../images/profile-3.jpg";
import profile4 from "./../../images/profile-4.jpg";

const RECENT_UPDATES = [
    { id: 1, img: profile4, name: "Babar Khan", action: "placed an order", product: "USB-C Hub", time: "2 min ago", type: "order" },
    { id: 2, img: profile3, name: "Ali Hassan", action: "left a review", product: "Wireless Mouse", time: "18 min ago", type: "review" },
    { id: 3, img: profile2, name: "Ramzan Malik", action: "received order", product: "Bluetooth Speaker", time: "1 hr ago", type: "deliver" },
    { id: 4, img: profile1, name: "Sara Iqbal", action: "added to wishlist", product: "Headphones Pro", time: "2 hr ago", type: "wish" },
];

const UPDATE_ICONS = {
    order: { icon: "shopping_bag", bg: "#eef2ff", color: "#6366f1" },
    review: { icon: "star", bg: "#fffbeb", color: "#f59e0b" },
    deliver: { icon: "local_shipping", bg: "#f0fdf4", color: "#10b981" },
    wish: { icon: "favorite", bg: "#fff1f2", color: "#f43f5e" },
};

const WEEKLY_DATA = [
    { day: "Mon", sales: 42 },
    { day: "Tue", sales: 63 },
    { day: "Wed", sales: 51 },
    { day: "Thu", sales: 78 },
    { day: "Fri", sales: 90 },
    { day: "Sat", sales: 67 },
    { day: "Sun", sales: 38 },
];
const MAX_SALES = Math.max(...WEEKLY_DATA.map(d => d.sales));

const TOP_PRODUCTS = [
    { name: "USB-C Hub", sales: 148, revenue: "₨ 44,252", trend: "+12%", up: true },
    { name: "Wireless Mouse", sales: 113, revenue: "₨ 33,787", trend: "+8%", up: true },
    { name: "Bluetooth Speaker", sales: 97, revenue: "₨ 48,500", trend: "-3%", up: false },
    { name: "Headphones Pro", sales: 84, revenue: "₨ 67,200", trend: "+21%", up: true },
];

const HEALTH = [
    { label: "Order Fulfillment", pct: 96, color: "#10b981" },
    { label: "Response Rate", pct: 88, color: "#6366f1" },
    { label: "Product Quality", pct: 94, color: "#f59e0b" },
    { label: "Customer Satisfaction", pct: 91, color: "#06b6d4" },
];

const Rightside = ({ isSidebarOpen = false, onOpenSidebar = () => { }, onCloseSidebar = () => { } }) => {
    const dispatch = useDispatch();
    const profiledata = useSelector(state => state.customer.sellerprofile);
    const sellerId = useSelector(state => state.customer.userID) || localStorage.getItem("userID");
    const themeRef = useRef(null);

    useEffect(() => {
        const loadSellerProfile = async () => {
            if (!sellerId) return;
            try {
                const response = await API.get(`/seller/getprofile/${sellerId}`);
                if (response?.data?.status === "success" && response?.data?.profile) {
                    dispatch(sellerprofiledata(response.data.profile));
                }
            } catch (_) {
                // keep fallback UI when profile is unavailable
            }
        };

        loadSellerProfile();
    }, [dispatch, sellerId]);

    useEffect(() => {
        if (!themeRef.current) return;
        const spans = themeRef.current.querySelectorAll('span');
        spans.forEach(span => {
            span.addEventListener('click', () => {
                spans.forEach(s => s.classList.remove('active'));
                span.classList.add('active');
                document.body.classList.toggle('dark-theme-variables', span.textContent.trim() === 'dark_mode');
            });
        });
    }, []);

    const sellerName = profiledata?.name || "Seller";
    const sellerEmail = profiledata?.userID?.email || profiledata?.email || "";
    const sellerImg = profiledata?.profileimg || null;
    const sellerMobile = profiledata?.mobileno || "";
    const sellerAddress = profiledata?.address || "";

    return (
        <>
            {/* ── overlay for mobile sidebar ── */}
            <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={onCloseSidebar} />

            {/* ONE single wrapper that occupies the 3rd grid column */}
            <div className="right">

                {/* ── TOP BAR ── */}
                <div className="top">
                    <button id="menu_bar" aria-label="Open menu" onClick={onOpenSidebar}>
                        <span className="material-symbols-sharp">menu</span>
                    </button>

                    <div className="theme-toggler" ref={themeRef} role="group" aria-label="Theme">
                        <span className="material-symbols-sharp active" title="Light">light_mode</span>
                        <span className="material-symbols-sharp" title="Dark">dark_mode</span>
                    </div>

                    <div className="profile">
                        <div className="info">
                            <p><b>{sellerName}</b></p>
                            <small>Seller</small>
                            {sellerEmail && <p className="seller-email"><span>{sellerEmail}</span></p>}
                        </div>
                    </div>

                    <div className="profile-photo">
                        {sellerImg
                            ? <img src={sellerImg} alt="Profile" />
                            : <img src={profile1} alt="Profile" />
                        }
                    </div>
                </div>

                {/* ── scrollable content below topbar ── */}

                {/* ── PROFILE CARD ── */}
                <div className="rp-profile-card">
                    <div className="rp-profile-banner" />
                    <div className="rp-profile-body">
                        <div className="rp-avatar-wrap">
                            {sellerImg
                                ? <img src={sellerImg} alt={sellerName} className="rp-avatar" />
                                : <div className="rp-avatar-fallback">{sellerName.charAt(0).toUpperCase()}</div>
                            }
                            <span className="rp-online-dot" />
                        </div>
                        <h3 className="rp-name">{sellerName}</h3>
                        {sellerEmail && <p className="rp-email">{sellerEmail}</p>}
                        {sellerMobile && <p className="rp-phone" style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--color-info-dark)" }}><span className="material-symbols-sharp" style={{ fontSize: "1rem", verticalAlign: "middle", marginRight: "4px" }}>call</span>{sellerMobile}</p>}
                        {sellerAddress && <p className="rp-address" style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--color-info-dark)" }}><span className="material-symbols-sharp" style={{ fontSize: "1rem", verticalAlign: "middle", marginRight: "4px" }}>location_on</span>{sellerAddress}</p>}
                        <span className="rp-badge">
                            <span className="material-symbols-sharp">verified</span>
                            Verified Seller
                        </span>
                        <div className="rp-stats">
                            <div className="rp-stat">
                                <span className="rp-stat-val">₨ 25k</span>
                                <span className="rp-stat-lbl">Revenue</span>
                            </div>
                            <div className="rp-stat-divider" />
                            <div className="rp-stat">
                                <span className="rp-stat-val">438</span>
                                <span className="rp-stat-lbl">Orders</span>
                            </div>
                            <div className="rp-stat-divider" />
                            <div className="rp-stat">
                                <span className="rp-stat-val">4.8 ★</span>
                                <span className="rp-stat-lbl">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── WEEKLY SALES CHART ── */}
                <div className="rp-card">
                    <div className="rp-card-header">
                        <div>
                            <h4>Weekly Sales</h4>
                            <p>Orders overview this week</p>
                        </div>
                        <span className="rp-up-badge">↑ 14%</span>
                    </div>
                    <div className="rp-chart">
                        {WEEKLY_DATA.map((d, i) => (
                            <div className="rp-bar-col" key={i}>
                                <div className="rp-bar-wrap">
                                    <div
                                        className="rp-bar"
                                        style={{ height: `${(d.sales / MAX_SALES) * 100}%` }}
                                    >
                                        <span className="rp-bar-tooltip">{d.sales}</span>
                                    </div>
                                </div>
                                <span className="rp-bar-label">{d.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="rp-chart-legend">
                        <span className="rp-legend-dot" style={{ background: '#6366f1' }} />
                        <span>Sales this week</span>
                        <strong style={{ marginLeft: 'auto', color: '#10b981' }}>₨ 1,24,800</strong>
                    </div>
                </div>

                {/* ── RECENT ACTIVITY ── */}
                <div className="rp-card">
                    <div className="rp-card-header">
                        <div>
                            <h4>Recent Activity</h4>
                            <p>Live customer actions</p>
                        </div>
                        <span className="rp-live-pill">
                            <span className="rp-live-dot" />Live
                        </span>
                    </div>
                    <div className="rp-activity-list">
                        {RECENT_UPDATES.map(u => {
                            const meta = UPDATE_ICONS[u.type];
                            return (
                                <div className="rp-activity-item" key={u.id}>
                                    <div className="rp-activity-img-wrap">
                                        <img src={u.img} alt={u.name} className="rp-activity-img" />
                                        <div className="rp-activity-type-icon" style={{ background: meta.bg, color: meta.color }}>
                                            <span className="material-symbols-sharp">{meta.icon}</span>
                                        </div>
                                    </div>
                                    <div className="rp-activity-text">
                                        <p><b>{u.name}</b> {u.action}</p>
                                        <span className="rp-activity-product">{u.product}</span>
                                        <span className="rp-activity-time">{u.time}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── TOP PRODUCTS ── */}
                <div className="rp-card">
                    <div className="rp-card-header">
                        <div>
                            <h4>Top Products</h4>
                            <p>Best sellers this month</p>
                        </div>
                        <Link to="/seller/productlist" className="rp-see-all">See all</Link>
                    </div>
                    <div className="rp-top-products">
                        {TOP_PRODUCTS.map((p, i) => (
                            <div className="rp-product-row" key={i}>
                                <div className="rp-product-rank">#{i + 1}</div>
                                <div className="rp-product-info">
                                    <p className="rp-product-name">{p.name}</p>
                                    <span className="rp-product-rev">{p.revenue}</span>
                                </div>
                                <div className="rp-product-meta">
                                    <span className={`rp-trend ${p.up ? 'up' : 'down'}`}>{p.trend}</span>
                                    <span className="rp-sales-count">{p.sales} sold</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── QUICK ACTIONS ── */}
                <div className="rp-card">
                    <div className="rp-card-header">
                        <div>
                            <h4>Quick Actions</h4>
                            <p>Frequently used shortcuts</p>
                        </div>
                    </div>
                    <div className="rp-quick-grid">
                        <Link to="/seller/addproduct" className="rp-quick-btn rp-q-purple">
                            <span className="material-symbols-sharp">add_box</span>
                            <span>Add Product</span>
                        </Link>
                        <Link to="/seller/orders" className="rp-quick-btn rp-q-blue">
                            <span className="material-symbols-sharp">shopping_bag</span>
                            <span>Orders</span>
                        </Link>
                        <Link to="/seller/analytics" className="rp-quick-btn rp-q-green">
                            <span className="material-symbols-sharp">insights</span>
                            <span>Analytics</span>
                        </Link>
                        <Link to="/seller/settings" className="rp-quick-btn rp-q-amber">
                            <span className="material-symbols-sharp">settings</span>
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>

                {/* ── STORE HEALTH ── */}
                <div className="rp-card" style={{ marginBottom: '2rem' }}>
                    <div className="rp-card-header">
                        <div>
                            <h4>Store Health</h4>
                            <p>Performance score</p>
                        </div>
                        <span className="rp-score-badge">92/100</span>
                    </div>
                    <div className="rp-health-items">
                        {HEALTH.map((h, i) => (
                            <div className="rp-health-row" key={i}>
                                <div className="rp-health-info">
                                    <span>{h.label}</span>
                                    <span style={{ color: h.color, fontWeight: 700 }}>{h.pct}%</span>
                                </div>
                                <div className="rp-health-bar">
                                    <div className="rp-health-fill" style={{ width: `${h.pct}%`, background: h.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>{/* end right */}
        </>
    );
};

export default Rightside;
