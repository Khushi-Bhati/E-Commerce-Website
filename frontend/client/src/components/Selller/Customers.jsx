import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from '../../config/api.js';
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Customers.css";

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

const getAddressText = (shippingaddress) => {
    if (!Array.isArray(shippingaddress) || shippingaddress.length === 0) {
        return "-";
    }
    return shippingaddress.filter(Boolean).join(", ");
};

const Customers = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");

    const getCustomers = useCallback(async () => {
        if (!sellerId) {
            setCustomers([]);
            setError("Seller session not found. Please login again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/seller/customers/${sellerId}`);
            if (response.data.status === "success") {
                setCustomers(response.data.customers || []);
            } else {
                setCustomers([]);
                setError(response.data.message || "Failed to load customers.");
            }
        } catch (requestError) {
            setCustomers([]);
            setError(requestError?.response?.data?.message || "Failed to load customers. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getCustomers();
    }, [getCustomers]);

    const filteredCustomers = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) {
            return customers;
        }

        return customers.filter((customer) => {
            const name = (customer?.name || "").toLowerCase();
            const email = (customer?.userID?.email || "").toLowerCase();
            const mobile = (customer?.mobileno || "").toLowerCase();
            return name.includes(keyword) || email.includes(keyword) || mobile.includes(keyword);
        });
    }, [customers, searchText]);

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="customers-main">
                <div className="customers-header">
                    <h1>Customers</h1>
                    <button type="button" className="customers-refresh-btn" onClick={getCustomers} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                <div className="customers-toolbar">
                    <div className="customers-summary-card">
                        <p>Total Customers</p>
                        <h2>{customers.length}</h2>
                    </div>
                    <div className="customers-search-wrap">
                        <label htmlFor="customer-search">Search</label>
                        <input
                            id="customer-search"
                            type="text"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Name, email, mobile"
                        />
                    </div>
                </div>

                {loading && <div className="customers-state-card">Loading customers...</div>}

                {!loading && error && (
                    <div className="customers-state-card customers-error-card">
                        <p>{error}</p>
                        <button type="button" className="customers-retry-btn" onClick={getCustomers}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && customers.length === 0 && (
                    <div className="customers-state-card">No customers found for this seller.</div>
                )}

                {!loading && !error && customers.length > 0 && filteredCustomers.length === 0 && (
                    <div className="customers-state-card">No customers matched your search.</div>
                )}

                {!loading && !error && filteredCustomers.length > 0 && (
                    <div className="customers-table-wrap">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Shipping Address</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id}>
                                        <td>
                                            <div className="customer-meta">
                                                {customer?.profileimg ? (
                                                    <img src={customer.profileimg} alt={customer?.name || "Customer"} />
                                                ) : (
                                                    <div className="customer-avatar-fallback">
                                                        {(customer?.name || "C").slice(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p>{customer?.name || customer?.userID?.name || "Unknown customer"}</p>
                                                    <small>{customer?.userID?.email || "-"}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{customer?.mobileno || "-"}</td>
                                        <td title={getAddressText(customer?.shippingaddress)}>
                                            {getAddressText(customer?.shippingaddress)}
                                        </td>
                                        <td>{formatDate(customer?.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Customers;
