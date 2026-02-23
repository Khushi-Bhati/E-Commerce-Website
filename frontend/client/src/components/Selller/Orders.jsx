import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from '../../config/api.js';
import Swal from "sweetalert2";
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Orders.css";

const ORDER_STATUS_OPTIONS = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled"
];

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) {
        return "Rs 0";
    }
    return `Rs ${amount.toLocaleString()}`;
};

const formatDate = (value) => {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return date.toLocaleDateString();
};

const getItemsPreview = (order) => {
    if (!Array.isArray(order?.items) || order.items.length === 0) {
        return "No items";
    }

    const preview = order.items
        .map((item) => {
            const name = item?.productId?.productname || "Product";
            const qty = Number(item?.quantity || 0);
            return `${name} x${qty || 1}`;
        })
        .join(", ");

    if (preview.length <= 90) {
        return preview;
    }

    return `${preview.slice(0, 87)}...`;
};

const buildOrderDraft = (order) => ({
    status: order?.status || "pending",
    paymentStatus: order?.paymentStatus || "pending"
});

const Orders = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [orders, setOrders] = useState([]);
    const [draftByOrderId, setDraftByOrderId] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState("");
    const [query, setQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPayment, setFilterPayment] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [expandedOrderId, setExpandedOrderId] = useState("");
    const [lastErrorDetail, setLastErrorDetail] = useState(null);

    const hydrateDrafts = (items) => {
        const nextDrafts = {};
        (items || []).forEach((order) => {
            nextDrafts[order._id] = buildOrderDraft(order);
        });
        setDraftByOrderId(nextDrafts);
    };

    const getOrders = useCallback(async () => {
        if (!sellerId) {
            setOrders([]);
            const msg = "Seller session not found. Please login again.";
            setError(msg);
            setLastErrorDetail({ message: msg });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/order/seller/${sellerId}`);
            if (response.data.status === "success") {
                const fetchedOrders = response.data.orders || [];
                setOrders(fetchedOrders);
                hydrateDrafts(fetchedOrders);
            } else {
                setOrders([]);
                setError(response.data.message || "Failed to load orders.");
            }
        } catch (requestError) {
            setOrders([]);
            const fallback = requestError?.response?.data?.message || requestError?.message || "Failed to load orders. Please try again.";
            setError(fallback);
            setLastErrorDetail({
                message: requestError?.message,
                status: requestError?.response?.status,
                data: requestError?.response?.data
            });

            if (requestError?.response?.status === 401) {
                localStorage.removeItem('userID');
                window.location.href = '/seller/login';
                return;
            }
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    const filteredOrders = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        return (orders || []).filter((o) => {
            if (filterStatus && o.status !== filterStatus) return false;
            if (filterPayment && o.paymentStatus !== filterPayment) return false;

            if (!q) return true;

            const orderNumber = String(o.orderNumber || o._id || '').toLowerCase();
            const buyerName = (o?.buyerId?.name || '').toLowerCase();
            const itemsText = (o.items || []).map(i => (i?.productId?.productname || '').toLowerCase()).join(' ');

            return orderNumber.includes(q) || buyerName.includes(q) || itemsText.includes(q);
        });
    }, [orders, query, filterStatus, filterPayment]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const visibleOrders = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, page, pageSize]);

    useEffect(() => {
        // reset to first page when filters/search change
        setPage(1);
    }, [query, filterStatus, filterPayment, pageSize]);

    const exportCsv = () => {
        try {
            const rows = filteredOrders.map(o => ({
                orderId: o._id,
                orderNumber: o.orderNumber || '',
                date: o.createdAt || '',
                buyer: o?.buyerId?.name || '',
                email: o?.buyerId?.email || '',
                total: o.totalAmount || '',
                status: o.status || '',
                paymentStatus: o.paymentStatus || ''
            }));

            if (rows.length === 0) {
                Swal.fire({ icon: 'info', title: 'No rows to export' });
                return;
            }

            const header = Object.keys(rows[0] || {}).join(',');
            const csv = [header].concat(rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))).join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setLastErrorDetail({ message: err?.message, stack: err?.stack });
            Swal.fire({ icon: 'error', title: 'Failed to export CSV', text: err?.message || '' });
        }
    };

    const handleDraftChange = (orderId, field, value) => {
        setDraftByOrderId((prev) => ({
            ...prev,
            [orderId]: {
                ...(prev[orderId] || {}),
                [field]: value
            }
        }));
    };

    const updateOrder = async (order) => {
        const draft = draftByOrderId[order._id] || buildOrderDraft(order);
        const nextStatus = draft.status;
        const nextPaymentStatus = draft.paymentStatus;

        if (!ORDER_STATUS_OPTIONS.includes(nextStatus) || !PAYMENT_STATUS_OPTIONS.includes(nextPaymentStatus)) {
            Swal.fire({
                icon: "error",
                title: "Select valid status values"
            });
            return;
        }

        const payload = {};
        if (nextStatus !== order.status) {
            payload.status = nextStatus;
        }
        if (nextPaymentStatus !== order.paymentStatus) {
            payload.paymentStatus = nextPaymentStatus;
        }

        if (Object.keys(payload).length === 0) {
            Swal.fire({
                icon: "info",
                title: "No status changes to save"
            });
            return;
        }

        try {
            setUpdatingOrderId(order._id);
            const response = await API.put(`/order/status/${order._id}`, payload);

            if (response.data.status === "success") {
                setOrders((prev) =>
                    prev.map((item) => {
                        if (item._id !== order._id) {
                            return item;
                        }
                        return {
                            ...item,
                            ...payload
                        };
                    })
                );
                Swal.fire({
                    icon: "success",
                    title: response.data.message || "Order updated"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: response.data.message || "Failed to update order"
                });
            }
        } catch (requestError) {
            Swal.fire({
                icon: "error",
                title: requestError?.response?.data?.message || requestError?.message || "Failed to update order"
            });
            setLastErrorDetail({ message: requestError?.message, status: requestError?.response?.status, data: requestError?.response?.data });

            if (requestError?.response?.status === 401) {
                localStorage.removeItem('userID');
                window.location.href = '/seller/login';
                return;
            }
        } finally {
            setUpdatingOrderId("");
        }
    };

    const showErrorDetails = () => {
        if (!lastErrorDetail) {
            Swal.fire({ icon: 'info', title: 'No additional details' });
            return;
        }
        const pre = JSON.stringify(lastErrorDetail, null, 2);
        Swal.fire({
            title: 'Error details',
            html: `<pre style="text-align:left;white-space:pre-wrap;word-break:break-word">${pre}</pre>`,
            width: 700
        });
    };

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="orders-main">
                <div className="orders-header">
                    <h1>Orders</h1>
                    <button type="button" className="orders-refresh-btn" onClick={getOrders} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                <div className="orders-summary-card">
                    <p>Total Orders</p>
                    <h2>{orders.length}</h2>
                </div>

                <div className="orders-toolbar">
                    <div className="orders-search">
                        <input placeholder="Search by order, customer or product" value={query} onChange={e => setQuery(e.target.value)} />
                    </div>

                    <div className="orders-filters">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All statuses</option>
                            {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                            <option value="">All payments</option>
                            {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                        </select>

                        <button className="orders-export-btn" onClick={exportCsv} disabled={filteredOrders.length === 0}>Export CSV</button>
                    </div>
                </div>

                {loading && <div className="orders-state-card">Loading orders...</div>}

                {!loading && error && (
                    <div className="orders-state-card orders-error-card">
                        <p>{error}</p>
                        <div className="orders-error-actions">
                            <button type="button" className="orders-retry-btn" onClick={getOrders}>
                                Retry
                            </button>
                            <button type="button" className="orders-detail-btn" onClick={showErrorDetails}>
                                Details
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="orders-state-card">No orders matched your search/filters.</div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="orders-table-wrap">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Order Status</th>
                                    <th>Payment Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleOrders.map((order) => {
                                    const draft = draftByOrderId[order._id] || buildOrderDraft(order);
                                    const hasChanges =
                                        draft.status !== order.status || draft.paymentStatus !== order.paymentStatus;
                                    const isUpdating = updatingOrderId === order._id;

                                    return (
                                        <React.Fragment key={order._id}>
                                            <tr>
                                                <td>
                                                    <p className="order-number">{order.orderNumber || order._id}</p>
                                                    <small>{formatDate(order.createdAt)}</small>
                                                </td>
                                                <td>
                                                    <p>{order?.buyerId?.name || "Unknown buyer"}</p>
                                                    <small>{order?.buyerId?.email || "-"}</small>
                                                </td>
                                                <td title={getItemsPreview(order)}>{getItemsPreview(order)}</td>
                                                <td>{formatCurrency(order.totalAmount)}</td>
                                                <td>
                                                    <select
                                                        value={draft.status}
                                                        disabled={isUpdating}
                                                        onChange={(event) =>
                                                            handleDraftChange(order._id, "status", event.target.value)
                                                        }
                                                    >
                                                        {ORDER_STATUS_OPTIONS.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        value={draft.paymentStatus}
                                                        disabled={isUpdating}
                                                        onChange={(event) =>
                                                            handleDraftChange(order._id, "paymentStatus", event.target.value)
                                                        }
                                                    >
                                                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="orders-update-btn"
                                                        disabled={!hasChanges || isUpdating}
                                                        onClick={() => updateOrder(order)}
                                                    >
                                                        {isUpdating ? "Saving..." : "Update"}
                                                    </button>
                                                    <div className="orders-row-actions">
                                                        <button type="button" className="orders-expand-btn" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? '' : order._id)}>
                                                            {expandedOrderId === order._id ? 'Hide' : 'Details'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {
                                                expandedOrderId === order._id && (
                                                    <tr className="orders-expanded-row">
                                                        <td colSpan={7}>
                                                            <div className="orders-expanded-content">
                                                                <h4>Items</h4>
                                                                <ul>
                                                                    {(order.items || []).map((it, idx) => (
                                                                        <li key={idx}>{(it?.productId?.productname || 'Product')} — qty: {it.quantity || 1} — Rs {it.price || '-'}</li>
                                                                    ))}
                                                                </ul>
                                                                <h4>Shipping</h4>
                                                                <p>{order?.shippingAddress || 'No shipping info'}</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>

                        <div className="orders-pagination">
                            <div className="orders-pagination-info">Showing {Math.min(filteredOrders.length, (page - 1) * pageSize + 1)} - {Math.min(filteredOrders.length, page * pageSize)} of {filteredOrders.length}</div>
                            <div className="orders-pagination-controls">
                                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&laquo; Prev</button>
                                <span>Page {page} / {totalPages}</span>
                                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next &raquo;</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Orders;
