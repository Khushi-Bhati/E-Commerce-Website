import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../../config/api.js";
import Swal from "sweetalert2";
import Header from "./Header";
import Footer from "./Footer";
import "./../styles/checkout.css";

const PAYMENT_METHODS = [
    { id: "cod", label: "COD", icon: "💵", desc: "Cash on Delivery" },
    { id: "upi", label: "UPI", icon: "📱", desc: "UPI / QR Pay" },
    { id: "card", label: "Card", icon: "💳", desc: "Credit / Debit" },
    { id: "netbanking", label: "Net Bank", icon: "🏦", desc: "Net Banking" },
    { id: "wallet", label: "Wallet", icon: "👛", desc: "Digital Wallet" },
];

const toNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    /* ─ data passed from Cart ─ */
    const cartData = location.state?.cartData || null;
    const totals = location.state?.totals || { itemCount: 0, subTotal: 0 };
    const checkoutItems = location.state?.checkoutItems || [];   // grouped by seller
    const userId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

    /* ─ form state ─ */
    const [address, setAddress] = useState(location.state?.shippingAddress || "");
    const [method, setMethod] = useState("cod");
    const [errors, setErrors] = useState({});
    const [placing, setPlacing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);   // 1 = address, 2 = payment

    /* redirect if no cart data passed */
    useEffect(() => {
        if (!cartData || checkoutItems.length === 0) {
            navigate("/customer/cart");
        }
    }, [cartData, checkoutItems, navigate]);

    /* ── Validation ── */
    const validate = () => {
        const e = {};
        if (!address.trim() || address.trim().length < 8)
            e.address = "Please enter a valid shipping address (min 8 characters).";
        return e;
    };

    /* ── Place order logic ── */
    const handlePlaceOrder = async () => {
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        if (!userId || placing) return;

        try {
            setPlacing(true);

            const createdOrders = [];
            const paymentDetailsList = [];

            for (const group of checkoutItems) {
                const orderRes = await API.post("/order/create", {
                    buyerId: userId,
                    sellerId: group.sellerId,
                    items: group.items,
                    totalAmount: group.totalAmount,
                    shippingAddress: address.trim(),
                });

                if (orderRes.data.status !== "success" || !orderRes.data.order?._id)
                    throw new Error(orderRes.data.message || "Failed to create order");

                createdOrders.push(orderRes.data.order);
                paymentDetailsList.push({
                    orderId: orderRes.data.order._id,
                    buyerId: userId,
                    sellerId: group.sellerId,
                    amount: group.totalAmount,
                });
            }

            /* ── Stripe (Card) → redirect ── */
            if (method !== "cod") {
                localStorage.setItem("pendingStripePayment", JSON.stringify({
                    method,
                    paymentDetails: paymentDetailsList
                }));

                const sessionRes = await API.post("/payment/stripe/create-session", {
                    paymentDetails: paymentDetailsList,
                    totalAmount: totals.subTotal,
                    method,
                });

                if (sessionRes.data.url) {
                    window.location.href = sessionRes.data.url;
                    return;
                }
                throw new Error("Could not create Stripe session.");
            }

            /* ── Other methods: record payment immediately ── */
            for (const details of paymentDetailsList) {
                const payRes = await API.post("/payment/create", {
                    ...details,
                    method,
                    transactionId: "",
                });
                if (payRes.data.status !== "success")
                    throw new Error(payRes.data.message || "Failed to record payment");
            }

            /* ── Clear cart ── */
            await API.delete(`/cart/clear/${userId}`);

            Swal.fire({
                icon: "success",
                title: "🎉 Order Placed Successfully!",
                html: `
          <div style="text-align:left;font-family:'Inter',sans-serif">
            <p style="margin:6px 0"><b>Orders created:</b> ${createdOrders.length}</p>
            <p style="margin:6px 0"><b>Total amount:</b> ₹${toNumber(totals.subTotal).toFixed(2)}</p>
            <p style="margin:6px 0"><b>Payment method:</b> ${method.toUpperCase()}</p>
          </div>
        `,
                confirmButtonColor: "#6366f1",
            }).then(() => navigate("/customer/home"));

        } catch (err) {
            console.error("checkout error", err);
            Swal.fire({
                icon: "error",
                title: "Order Failed",
                text: err?.response?.data?.message || err?.message || "Checkout failed. Please try again.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setPlacing(false);
        }
    };

    const stepDone = (n) => currentStep > n;
    const stepActive = (n) => currentStep === n;

    return (
        <>
            <Header cartCount={totals.itemCount || 0} />

            <main className="checkout-page">

                {/* Back link */}
                <Link to="/customer/cart" className="checkout-back">
                    ← &nbsp;Back to Cart
                </Link>

                {/* Heading */}
                <div className="checkout-heading">
                    <h1>Secure Checkout</h1>
                    <p>Complete your purchase safely and quickly</p>
                </div>

                {/* Progress steps */}
                <div className="checkout-steps">
                    <div className={`checkout-step ${stepDone(1) ? "done" : ""} ${stepActive(1) ? "active" : ""}`}>
                        <div className="checkout-step-circle">{stepDone(1) ? "✓" : "1"}</div>
                        <span className="checkout-step-label">Delivery</span>
                    </div>
                    <div className={`checkout-step-line ${stepDone(1) ? "done" : ""}`} />
                    <div className={`checkout-step ${stepDone(2) ? "done" : ""} ${stepActive(2) ? "active" : ""}`}>
                        <div className="checkout-step-circle">{stepDone(2) ? "✓" : "2"}</div>
                        <span className="checkout-step-label">Payment</span>
                    </div>
                    <div className={`checkout-step-line ${stepDone(2) ? "done" : ""}`} />
                    <div className={`checkout-step ${stepDone(3) ? "done" : ""} ${stepActive(3) ? "active" : ""}`}>
                        <div className="checkout-step-circle">3</div>
                        <span className="checkout-step-label">Confirm</span>
                    </div>
                </div>

                {/* Main grid */}
                <div className="checkout-grid-layout">

                    {/* ── Left: form ── */}
                    <div className="checkout-form-panel">

                        {/* Step 1: Delivery Address */}
                        {currentStep >= 1 && (
                            <div className="checkout-glass-card checkout-delivery-card">
                                <div className="payment-section-header">
                                    <h2>📦 Delivery Address</h2>
                                    <p>Where should we deliver your order?</p>
                                </div>
                                <div className="payment-section-body">
                                    <div className="checkout-form-group">
                                        <label>Full Shipping Address</label>
                                        <textarea
                                            rows={3}
                                            value={address}
                                            onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: undefined })); }}
                                            placeholder="House / flat number, street, city, state, PIN code…"
                                        />
                                        {errors.address && <span className="checkout-form-error">{errors.address}</span>}
                                    </div>

                                    {currentStep === 1 && (
                                        <button
                                            className="checkout-continue-btn"
                                            onClick={() => {
                                                if (!address.trim() || address.trim().length < 8) {
                                                    setErrors({ address: "Please enter a valid shipping address (min 8 characters)." });
                                                    return;
                                                }
                                                setErrors({});
                                                setCurrentStep(2);
                                            }}
                                        >
                                            Continue to Payment →
                                        </button>
                                    )}
                                    {currentStep > 1 && (
                                        <button
                                            className="checkout-edit-link"
                                            onClick={() => setCurrentStep(1)}
                                        >
                                            ✏️ Edit address
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep >= 2 && (
                            <div className="checkout-glass-card">
                                <div className="payment-section-header">
                                    <h2>💳 Payment Method</h2>
                                    <p>Choose how you'd like to pay</p>
                                </div>
                                <div className="payment-section-body">
                                    <p className="payment-methods-label">Select a payment method</p>

                                    <div className="payment-method-grid">
                                        {PAYMENT_METHODS.map((pm) => (
                                            <div
                                                key={pm.id}
                                                className={`payment-method-card ${method === pm.id ? "selected" : ""}`}
                                                onClick={() => setMethod(pm.id)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === "Enter" && setMethod(pm.id)}
                                                aria-label={`Select ${pm.label} as payment method`}
                                            >
                                                {method === pm.id && (
                                                    <span className="payment-method-selected-badge">✓</span>
                                                )}
                                                <span className="payment-method-icon">{pm.icon}</span>
                                                <span className="payment-method-name">{pm.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Stripe badge for all online methods */}
                                    {method !== "cod" && (
                                        <div className="checkout-info-box stripe">
                                            <span className="checkout-info-box-icon">🔒</span>
                                            <span>
                                                You'll be redirected to <strong>Stripe's secure payment page</strong> to complete your payment.
                                            </span>
                                        </div>
                                    )}

                                    {/* COD info */}
                                    {method === "cod" && (
                                        <div className="checkout-info-box cod">
                                            <ion-icon name="bulb-outline" className="checkout-info-box-icon"></ion-icon>
                                            <span>Pay with cash when your order is delivered. No transaction ID needed.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Order Summary ── */}
                    <div className="checkout-summary-panel">
                        <div className="checkout-glass-card">
                            <div className="payment-section-header">
                                <h2>🛍️ Order Summary</h2>
                                <p>{totals.itemCount} item{totals.itemCount !== 1 ? "s" : ""} in your cart</p>
                            </div>

                            {/* Item list */}
                            <div className="checkout-summary-items">
                                {(cartData?.items || []).map((item) => {
                                    const price = toNumber(item.product?.discount || item.product?.price);
                                    return (
                                        <div key={item.productId} className="checkout-summary-item">
                                            <img
                                                className="checkout-summary-item-img"
                                                src={item.product?.productimg?.[0] || "https://placehold.co/50x50/1e1b4b/a5b4fc?text=P"}
                                                alt={item.product?.productname}
                                            />
                                            <div className="checkout-summary-item-info">
                                                <p className="checkout-summary-item-name">{item.product?.productname}</p>
                                                <p className="checkout-summary-item-qty">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="checkout-summary-item-price">
                                                ₹{(price * toNumber(item.quantity)).toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="checkout-totals">
                                <div className="checkout-total-row">
                                    <span>Subtotal ({totals.itemCount} items)</span>
                                    <span>₹{toNumber(totals.subTotal).toFixed(2)}</span>
                                </div>
                                <div className="checkout-total-row">
                                    <span>Shipping</span>
                                    <span style={{ color: "#34d399" }}>FREE</span>
                                </div>
                                <div className="checkout-total-row">
                                    <span>Tax</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="checkout-total-row grand">
                                    <span>Total</span>
                                    <span>₹{toNumber(totals.subTotal).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Pay now button — only show on step 2 */}
                            {currentStep >= 2 && (
                                <>
                                    <button
                                        id="checkout-pay-now-btn"
                                        className="checkout-pay-btn"
                                        onClick={handlePlaceOrder}
                                        disabled={placing}
                                    >
                                        {placing
                                            ? "Processing…"
                                            : method !== "cod"
                                                ? "🔒 Pay with Stripe →"
                                                : `✅ Place Order — ₹${toNumber(totals.subTotal).toFixed(2)}`
                                        }
                                    </button>
                                    <p className="checkout-security-note">
                                        🔒 &nbsp;256-bit SSL encrypted &amp; secure checkout
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default CheckoutPage;
