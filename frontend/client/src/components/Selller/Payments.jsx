import React, { useCallback, useEffect, useState } from "react";
import API from '../../config/api.js';
import Swal from "sweetalert2";
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Payments.css";

const PAYMENT_STATUS_OPTIONS = ["pending", "success", "failed", "refunded"];

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

const buildStatusDraft = (payment) => payment?.status || "pending";

const Payments = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [payments, setPayments] = useState([]);
    const [statusDraftById, setStatusDraftById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingPaymentId, setUpdatingPaymentId] = useState("");

    const hydrateDrafts = (items) => {
        const nextDrafts = {};
        (items || []).forEach((payment) => {
            nextDrafts[payment._id] = buildStatusDraft(payment);
        });
        setStatusDraftById(nextDrafts);
    };

    const getPayments = useCallback(async () => {
        if (!sellerId) {
            setPayments([]);
            setError("Seller session not found. Please login again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/payment/seller/${sellerId}`);
            if (response.data.status === "success") {
                const fetchedPayments = response.data.payments || [];
                setPayments(fetchedPayments);
                hydrateDrafts(fetchedPayments);
            } else {
                setPayments([]);
                setError(response.data.message || "Failed to load payments.");
            }
        } catch (requestError) {
            setPayments([]);
            setError(requestError?.response?.data?.message || "Failed to load payments. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getPayments();
    }, [getPayments]);

    const handleDraftChange = (paymentId, nextStatus) => {
        setStatusDraftById((prev) => ({
            ...prev,
            [paymentId]: nextStatus
        }));
    };

    const updatePaymentStatus = async (payment) => {
        const nextStatus = statusDraftById[payment._id] || buildStatusDraft(payment);

        if (!PAYMENT_STATUS_OPTIONS.includes(nextStatus)) {
            Swal.fire({
                icon: "error",
                title: "Select a valid payment status"
            });
            return;
        }

        if (nextStatus === payment.status) {
            Swal.fire({
                icon: "info",
                title: "No status changes to save"
            });
            return;
        }

        try {
            setUpdatingPaymentId(payment._id);
            const response = await API.put(`/payment/status/${payment._id}`, { status: nextStatus });

            if (response.data.status === "success") {
                setPayments((prev) =>
                    prev.map((item) => {
                        if (item._id !== payment._id) {
                            return item;
                        }
                        return {
                            ...item,
                            status: nextStatus
                        };
                    })
                );
                Swal.fire({
                    icon: "success",
                    title: response.data.message || "Payment updated"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: response.data.message || "Failed to update payment"
                });
            }
        } catch (requestError) {
            Swal.fire({
                icon: "error",
                title: requestError?.response?.data?.message || "Failed to update payment"
            });
        } finally {
            setUpdatingPaymentId("");
        }
    };

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="payments-main">
                <div className="payments-header">
                    <h1>Payments</h1>
                    <button type="button" className="payments-refresh-btn" onClick={getPayments} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                <div className="payments-summary-grid">
                    <div className="payments-summary-card">
                        <p>Total Payments</p>
                        <h2>{payments.length}</h2>
                    </div>
                    <div className="payments-summary-card">
                        <p>Total Amount</p>
                        <h2>{formatCurrency(payments.reduce((total, payment) => total + Number(payment.amount || 0), 0))}</h2>
                    </div>
                </div>

                {loading && <div className="payments-state-card">Loading payments...</div>}

                {!loading && error && (
                    <div className="payments-state-card payments-error-card">
                        <p>{error}</p>
                        <button type="button" className="payments-retry-btn" onClick={getPayments}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && payments.length === 0 && (
                    <div className="payments-state-card">No payments found for this seller.</div>
                )}

                {!loading && !error && payments.length > 0 && (
                    <div className="payments-table-wrap">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Payment</th>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => {
                                    const draftStatus = statusDraftById[payment._id] || buildStatusDraft(payment);
                                    const hasChanges = draftStatus !== payment.status;
                                    const isUpdating = updatingPaymentId === payment._id;

                                    return (
                                        <tr key={payment._id}>
                                            <td>
                                                <p>{payment.transactionId || payment._id}</p>
                                                <small>{formatDate(payment.createdAt)}</small>
                                            </td>
                                            <td>
                                                <p>{payment?.orderId?.orderNumber || "-"}</p>
                                                <small>Order total: {formatCurrency(payment?.orderId?.totalAmount)}</small>
                                            </td>
                                            <td>
                                                <p>{payment?.buyerId?.name || "Unknown buyer"}</p>
                                                <small>{payment?.buyerId?.email || "-"}</small>
                                            </td>
                                            <td className="payments-method">{payment.method || "-"}</td>
                                            <td>{formatCurrency(payment.amount)}</td>
                                            <td>
                                                <select
                                                    value={draftStatus}
                                                    disabled={isUpdating}
                                                    onChange={(event) => handleDraftChange(payment._id, event.target.value)}
                                                >
                                                    {PAYMENT_STATUS_OPTIONS.map((statusValue) => (
                                                        <option key={statusValue} value={statusValue}>
                                                            {statusValue}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="payments-update-btn"
                                                    disabled={!hasChanges || isUpdating}
                                                    onClick={() => updatePaymentStatus(payment)}
                                                >
                                                    {isUpdating ? "Saving..." : "Update"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Payments;
