import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from '../../config/api.js';
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Analytics.css";

const DEFAULT_ANALYTICS = {
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalReviews: 0
};

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) {
        return "Rs 0";
    }
    return `Rs ${amount.toLocaleString()}`;
};

const toPercent = (value) => `${(value * 100).toFixed(1)}%`;

const Analytics = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getAnalytics = useCallback(async () => {
        if (!sellerId) {
            setAnalytics(DEFAULT_ANALYTICS);
            setError("Seller session not found. Please login again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/analytics/seller/${sellerId}`);
            if (response.data.status === "success") {
                setAnalytics({
                    ...DEFAULT_ANALYTICS,
                    ...(response.data.analytics || {})
                });
            } else {
                setAnalytics(DEFAULT_ANALYTICS);
                setError(response.data.message || "Failed to load analytics.");
            }
        } catch (requestError) {
            setAnalytics(DEFAULT_ANALYTICS);
            setError(requestError?.response?.data?.message || "Failed to load analytics. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getAnalytics();
    }, [getAnalytics]);

    const hasAnyData = useMemo(
        () =>
            Object.values(analytics).some((value) => {
                const asNumber = Number(value || 0);
                return Number.isFinite(asNumber) && asNumber > 0;
            }),
        [analytics]
    );

    const completionRate =
        analytics.totalOrders > 0 ? analytics.deliveredOrders / analytics.totalOrders : 0;
    const pendingRate = analytics.totalOrders > 0 ? analytics.pendingOrders / analytics.totalOrders : 0;
    const avgRevenuePerOrder =
        analytics.totalOrders > 0 ? Number(analytics.totalRevenue || 0) / analytics.totalOrders : 0;

    const metrics = [
        { label: "Total Orders", value: analytics.totalOrders },
        { label: "Pending Orders", value: analytics.pendingOrders },
        { label: "Delivered Orders", value: analytics.deliveredOrders },
        { label: "Total Revenue", value: formatCurrency(analytics.totalRevenue) },
        { label: "Total Products", value: analytics.totalProducts },
        { label: "Total Customers", value: analytics.totalCustomers },
        { label: "Total Reviews", value: analytics.totalReviews }
    ];

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="analytics-main">
                <div className="analytics-header">
                    <h1>Analytics</h1>
                    <button type="button" className="analytics-refresh-btn" onClick={getAnalytics} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {loading && <div className="analytics-state-card">Loading analytics...</div>}

                {!loading && error && (
                    <div className="analytics-state-card analytics-error-card">
                        <p>{error}</p>
                        <button type="button" className="analytics-retry-btn" onClick={getAnalytics}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && !hasAnyData && (
                    <div className="analytics-state-card">No analytics data available yet.</div>
                )}

                {!loading && !error && (
                    <>
                        <div className="analytics-metrics-grid">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="analytics-metric-card">
                                    <p>{metric.label}</p>
                                    <h2>{metric.value}</h2>
                                </div>
                            ))}
                        </div>

                        <div className="analytics-kpi-grid">
                            <div className="analytics-kpi-card">
                                <p>Order Completion Rate</p>
                                <h3>{toPercent(completionRate)}</h3>
                            </div>
                            <div className="analytics-kpi-card">
                                <p>Pending Order Rate</p>
                                <h3>{toPercent(pendingRate)}</h3>
                            </div>
                            <div className="analytics-kpi-card">
                                <p>Avg Revenue / Order</p>
                                <h3>{formatCurrency(avgRevenuePerOrder)}</h3>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Analytics;
