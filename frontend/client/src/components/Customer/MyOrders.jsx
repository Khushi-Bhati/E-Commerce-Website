import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import API from "../../config/api.js";
import "../../styles/my-orders.css";

const STATUS_FLOW = ["pending", "confirmed", "packed", "shipped", "delivered"];

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "Rs 0";
  return `Rs ${amount.toLocaleString("en-IN")}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const progressForStatus = (status) => {
  const current = normalize(status);
  if (current === "cancelled") return 0;
  const idx = STATUS_FLOW.findIndex((step) => step === current);
  if (idx < 0) return 8;
  return ((idx + 1) / STATUS_FLOW.length) * 100;
};

const statusClass = (status) => {
  const current = normalize(status);
  if (current === "delivered") return "ok";
  if (current === "cancelled" || current === "failed") return "bad";
  if (current === "shipped" || current === "packed" || current === "confirmed") return "info";
  return "warn";
};

const labelize = (value) => {
  const text = normalize(value);
  if (!text) return "Pending";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const MyOrders = () => {
  const buyerId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCart = useCallback(async () => {
    if (!buyerId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await API.get(`/cart/get/${buyerId}`);
      if (response.data.status === "success") {
        setCartCount(response.data?.totals?.itemCount || 0);
      }
    } catch (requestError) {
      console.log("cart fetch error", requestError);
      setCartCount(0);
    }
  }, [buyerId]);

  const fetchOrders = useCallback(async () => {
    if (!buyerId) {
      setOrders([]);
      setError("Session not found. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/order/buyer/${buyerId}`);
      if (response.data.status === "success") {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
        setError(response.data.message || "Failed to load orders.");
      }
    } catch (requestError) {
      setOrders([]);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load your orders right now."
      );
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchOrders();
    fetchCart();
  }, [fetchOrders, fetchCart]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = normalize(query);

    return (orders || []).filter((order) => {
      if (statusFilter !== "all" && normalize(order.status) !== statusFilter) return false;

      if (!normalizedQuery) return true;

      const text = [
        order.orderNumber,
        order?.sellerId?.name,
        order?.sellerId?.email,
        ...(order.items || []).map((item) => item?.productId?.productname || "")
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedQuery);
    });
  }, [orders, query, statusFilter]);

  const summary = useMemo(() => {
    const totalSpent = (orders || []).reduce(
      (accumulator, order) => accumulator + Number(order?.totalAmount || 0),
      0
    );

    const delivered = (orders || []).filter((order) => normalize(order.status) === "delivered").length;
    const inProgress = (orders || []).filter((order) => {
      const current = normalize(order.status);
      return ["pending", "confirmed", "packed", "shipped"].includes(current);
    }).length;
    const cancelled = (orders || []).filter((order) => normalize(order.status) === "cancelled").length;

    return {
      totalOrders: orders.length,
      delivered,
      inProgress,
      cancelled,
      totalSpent
    };
  }, [orders]);

  return (
    <div className="my-orders-page">
      <Header cartCount={cartCount} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="my-orders-main">
        <div className="container">
          <div className="my-orders-breadcrumb">
            <Link to="/customer/home">Home</Link>
            <span>/</span>
            <span>My Orders</span>
          </div>

          <section className="my-orders-hero">
            <div>
              <h1>My Orders</h1>
              <p>Track delivery status, payment state, and item details in one place.</p>
            </div>
            <button type="button" onClick={fetchOrders} className="my-orders-refresh-btn" disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </section>

          <section className="my-orders-summary-grid">
            <article className="my-orders-summary-card">
              <p>Total Orders</p>
              <h3>{summary.totalOrders}</h3>
            </article>
            <article className="my-orders-summary-card">
              <p>In Progress</p>
              <h3>{summary.inProgress}</h3>
            </article>
            <article className="my-orders-summary-card">
              <p>Delivered</p>
              <h3>{summary.delivered}</h3>
            </article>
            <article className="my-orders-summary-card">
              <p>Total Spent</p>
              <h3>{formatCurrency(summary.totalSpent)}</h3>
            </article>
          </section>

          <section className="my-orders-toolbar">
            <div className="my-orders-search">
              <ion-icon name="search-outline" />
              <input
                type="text"
                placeholder="Search by order number, seller, product..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </section>

          {loading && <div className="my-orders-state-card">Loading your orders...</div>}

          {!loading && error && (
            <div className="my-orders-state-card error">
              <p>{error}</p>
              <button type="button" onClick={fetchOrders}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="my-orders-state-card">
              <h3>No matching orders</h3>
              <p>Try changing filters or search text.</p>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <section className="my-orders-list">
              {filteredOrders.map((order) => (
                <article key={order._id} className="my-order-card">
                  <header className="my-order-head">
                    <div>
                      <p className="my-order-label">Order</p>
                      <h3>{order.orderNumber || order._id}</h3>
                      <small>{formatDateTime(order.createdAt)}</small>
                    </div>

                    <div className="my-order-head-right">
                      <span className={`my-pill ${statusClass(order.status)}`}>{labelize(order.status)}</span>
                      <span className={`my-pill outline ${statusClass(order.paymentStatus)}`}>
                        Payment: {labelize(order.paymentStatus)}
                      </span>
                    </div>
                  </header>

                  <div className="my-order-progress">
                    <div className="my-order-progress-track">
                      <div
                        className="my-order-progress-fill"
                        style={{ width: `${progressForStatus(order.status)}%` }}
                      />
                    </div>
                  </div>

                  <div className="my-order-meta-grid">
                    <div>
                      <p className="my-order-label">Seller</p>
                      <p className="my-order-value">{order?.sellerId?.name || "Seller"}</p>
                      <small>{order?.sellerId?.email || "-"}</small>
                    </div>
                    <div>
                      <p className="my-order-label">Items</p>
                      <p className="my-order-value">{(order.items || []).length}</p>
                    </div>
                    <div>
                      <p className="my-order-label">Order Total</p>
                      <p className="my-order-value">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  {(order.items || []).length > 0 && (
                    <div className="my-order-items">
                      {(order.items || []).map((item, index) => {
                        const product = item?.productId;
                        const image = product?.productimg?.[0] || "https://placehold.co/80x80/f1f5f9/64748b?text=Item";
                        const quantity = Number(item?.quantity || 1);
                        const unitPrice = Number(
                          item?.price || product?.discount || product?.price || 0
                        );
                        const lineTotal = unitPrice * quantity;

                        return (
                          <div className="my-order-item" key={`${order._id}-${index}`}>
                            <img src={image} alt={product?.productname || "Product"} />
                            <div>
                              <h4>{product?.productname || "Product"}</h4>
                              <p>Qty: {quantity}</p>
                            </div>
                            <strong>{formatCurrency(lineTotal)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {order?.shippingAddress && (
                    <div className="my-order-address">
                      <p className="my-order-label">Shipping Address</p>
                      <p>{order.shippingAddress}</p>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrders;
