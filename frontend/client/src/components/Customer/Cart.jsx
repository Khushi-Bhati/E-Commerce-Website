import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from '../../config/api.js';
import Swal from "sweetalert2";
import Header from "./Header";
import Footer from "./Footer";
import "./../styles/cart.css";

const PAYMENT_METHOD_OPTIONS = ["cod", "upi", "card", "netbanking", "wallet"];

const getAddressFromProfile = (profile) => {
    if (!profile) return "";
    const rawAddress = profile.shippingaddress;
    if (Array.isArray(rawAddress)) {
        return (rawAddress[0] || "").toString();
    }
    return (rawAddress || "").toString();
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const [totals, setTotals] = useState({ itemCount: 0, subTotal: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [checkoutForm, setCheckoutForm] = useState({
        shippingAddress: "",
        paymentMethod: "cod",
        transactionId: ""
    });
    const [checkoutErrors, setCheckoutErrors] = useState({});
    const [placingOrder, setPlacingOrder] = useState(false);

    const userId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

    const loadCart = useCallback(async () => {
        if (!userId) {
            setError("Please login first");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await API.get(`/cart/get/${userId}`);
            if (response.data.status === "success") {
                setCart(response.data.cart || { items: [] });
                setTotals(response.data.totals || { itemCount: 0, subTotal: 0 });
            } else {
                setError(response.data.message || "Failed to load cart");
            }
        } catch (requestError) {
            console.log("load cart error", requestError);
            setError("Failed to load cart");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadProfile = useCallback(async () => {
        if (!userId) {
            setProfileLoading(false);
            return;
        }

        try {
            setProfileLoading(true);
            const response = await API.get(`/customer/getprofile/${userId}`);
            if (response.data.status === "success") {
                const fetchedProfile = response.data.profile || null;
                setProfile(fetchedProfile);
                const address = getAddressFromProfile(fetchedProfile).trim();
                setCheckoutForm((prev) => ({
                    ...prev,
                    shippingAddress: prev.shippingAddress || address
                }));
            }
        } catch (requestError) {
            console.log("load profile error", requestError);
        } finally {
            setProfileLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadCart();
        loadProfile();
    }, [loadCart, loadProfile]);

    const updateQty = async (productId, quantity) => {
        if (quantity < 1 || !userId) return;
        try {
            const response = await API.put(`/cart/update/${userId}/${productId}`, { quantity });
            if (response.data.status === "success") {
                setCart(response.data.cart || { items: [] });
                setTotals(response.data.totals || { itemCount: 0, subTotal: 0 });
            }
        } catch (requestError) {
            console.log("update qty error", requestError);
        }
    };

    const removeItem = async (productId) => {
        if (!userId) return;
        try {
            const response = await API.delete(`/cart/remove/${userId}/${productId}`);
            if (response.data.status === "success") {
                setCart(response.data.cart || { items: [] });
                setTotals(response.data.totals || { itemCount: 0, subTotal: 0 });
            }
        } catch (requestError) {
            console.log("remove item error", requestError);
        }
    };

    const clearCart = async () => {
        if (!userId) return;
        try {
            const response = await API.delete(`/cart/clear/${userId}`);
            if (response.data.status === "success") {
                setCart(response.data.cart || { items: [] });
                setTotals(response.data.totals || { itemCount: 0, subTotal: 0 });
            }
        } catch (requestError) {
            console.log("clear cart error", requestError);
        }
    };

    const checkoutSummary = useMemo(() => {
        const groupedBySeller = {};
        (cart.items || []).forEach((item) => {
            const sellerId = (item?.product?.sellerID || "").toString().trim();
            if (!sellerId) {
                return;
            }

            const unitPrice = toNumber(item?.product?.discount || item?.product?.price);
            const quantity = toNumber(item?.quantity || 0);
            if (!quantity || !unitPrice) {
                return;
            }

            if (!groupedBySeller[sellerId]) {
                groupedBySeller[sellerId] = {
                    sellerId,
                    items: [],
                    totalAmount: 0
                };
            }

            groupedBySeller[sellerId].items.push({
                productId: item.productId,
                quantity,
                price: unitPrice
            });
            groupedBySeller[sellerId].totalAmount += unitPrice * quantity;
        });

        return Object.values(groupedBySeller);
    }, [cart.items]);

    const handleCheckoutChange = (event) => {
        const { name, value } = event.target;
        setCheckoutForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setCheckoutErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const validateCheckout = () => {
        const errors = {};
        const address = checkoutForm.shippingAddress.trim();
        const method = checkoutForm.paymentMethod;
        const transactionId = checkoutForm.transactionId.trim();

        if (!address || address.length < 8) {
            errors.shippingAddress = "Enter a valid shipping address.";
        }

        if (!PAYMENT_METHOD_OPTIONS.includes(method)) {
            errors.paymentMethod = "Select a valid payment method.";
        }

        if (method !== "cod" && !transactionId) {
            errors.transactionId = "Transaction ID is required for this payment method.";
        }

        if (checkoutSummary.length === 0) {
            errors.checkout = "No valid cart items available for checkout.";
        }

        return errors;
    };

    const placeOrder = async () => {
        if (!userId || placingOrder) return;

        const errors = validateCheckout();
        setCheckoutErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            setPlacingOrder(true);

            const createdOrders = [];
            for (const group of checkoutSummary) {
                const orderResponse = await API.post("/order/create", {
                    buyerId: userId,
                    sellerId: group.sellerId,
                    items: group.items,
                    totalAmount: group.totalAmount,
                    shippingAddress: checkoutForm.shippingAddress.trim()
                });

                if (orderResponse.data.status !== "success" || !orderResponse.data.order?._id) {
                    throw new Error(orderResponse.data.message || "Failed to create order");
                }

                const paymentResponse = await API.post("/payment/create", {
                    orderId: orderResponse.data.order._id,
                    buyerId: userId,
                    sellerId: group.sellerId,
                    amount: group.totalAmount,
                    method: checkoutForm.paymentMethod,
                    transactionId:
                        checkoutForm.paymentMethod === "cod" ? "" : checkoutForm.transactionId.trim()
                });

                if (paymentResponse.data.status !== "success") {
                    throw new Error(paymentResponse.data.message || "Failed to record payment");
                }

                createdOrders.push(orderResponse.data.order);
            }

            await clearCart();
            setCheckoutForm((prev) => ({
                ...prev,
                transactionId: ""
            }));

            Swal.fire({
                icon: "success",
                title: "Order placed successfully",
                html: `
                    <div style="text-align:left">
                      <p><b>Orders:</b> ${createdOrders.length}</p>
                      <p><b>Total amount:</b> Rs ${toNumber(totals.subTotal).toFixed(2)}</p>
                      <p><b>Payment method:</b> ${checkoutForm.paymentMethod.toUpperCase()}</p>
                    </div>
                `
            });
        } catch (checkoutError) {
            console.log("place order error", checkoutError);
            Swal.fire({
                icon: "error",
                title:
                    checkoutError?.response?.data?.message ||
                    checkoutError?.message ||
                    "Checkout failed. Please try again."
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <>
            <Header cartCount={totals.itemCount || 0} />
            <main className="cart-page">
                <h2 className="cart-title">My Cart <span>({totals.itemCount || 0})</span></h2>

                {loading && <p style={{ color: '#64748b', marginTop: 20 }}>Loading your cart…</p>}
                {!loading && error && <p style={{ color: '#ef4444', marginTop: 20 }}>{error}</p>}

                {!loading && !error && cart.items.length === 0 && (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Browse our products and add items you love.</p>
                        <a href="/customer/home">Start Shopping</a>
                    </div>
                )}

                {!loading && !error && cart.items.length > 0 && (
                    <div className="cart-layout">
                        {/* Left: Items */}
                        <div>
                            <div className="cart-items">
                                {cart.items.map((item) => (
                                    <div key={item.productId} className="cart-item">
                                        <img
                                            src={item.product?.productimg?.[0] || "https://placehold.co/100x100/f1f5f9/94a3b8?text=Product"}
                                            alt={item.product?.productname}
                                            className="cart-item-image"
                                        />
                                        <div className="cart-item-info">
                                            <h4 className="cart-item-title">{item.product?.productname}</h4>
                                            <p className="cart-item-price">
                                                Rs {item.product?.discount || item.product?.price}
                                            </p>
                                            <div className="qty-controls">
                                                <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                                            </div>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeItem(item.productId)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Sticky Panel */}
                        <div className="cart-panel">
                            <div className="cart-summary">
                                <h3>Order Summary</h3>
                                <div className="cart-summary-row">
                                    <span>Items</span>
                                    <span>{totals.itemCount}</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <strong>Rs {totals.subTotal}</strong>
                                </div>
                                <p className="cart-summary-meta">Split across {checkoutSummary.length} seller order(s)</p>
                                <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
                            </div>

                            <div className="checkout-card">
                                <div className="checkout-card-header">
                                    <h3>Checkout</h3>
                                    <p>Fill details below to place your order</p>
                                </div>
                                <div className="checkout-card-body">
                                    {!profileLoading && !profile && (
                                        <p className="checkout-profile-note">
                                            💡 <Link to="/customer/createprofile">Create your profile</Link> for faster checkout
                                        </p>
                                    )}

                                    <div className="checkout-grid">
                                        <div className="checkout-field checkout-full">
                                            <label>Shipping Address</label>
                                            <textarea
                                                id="shippingAddress"
                                                name="shippingAddress"
                                                rows={3}
                                                value={checkoutForm.shippingAddress}
                                                onChange={handleCheckoutChange}
                                                placeholder="Enter your full shipping address"
                                            />
                                            {checkoutErrors.shippingAddress && <small>{checkoutErrors.shippingAddress}</small>}
                                        </div>

                                        <div className="checkout-field">
                                            <label>Payment Method</label>
                                            <select
                                                id="paymentMethod"
                                                name="paymentMethod"
                                                value={checkoutForm.paymentMethod}
                                                onChange={handleCheckoutChange}
                                            >
                                                {PAYMENT_METHOD_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            {checkoutErrors.paymentMethod && <small>{checkoutErrors.paymentMethod}</small>}
                                        </div>

                                        <div className="checkout-field">
                                            <label>Transaction ID</label>
                                            <input
                                                id="transactionId"
                                                name="transactionId"
                                                value={checkoutForm.transactionId}
                                                onChange={handleCheckoutChange}
                                                placeholder={checkoutForm.paymentMethod === "cod" ? "Not required for COD" : "Enter transaction ID"}
                                                disabled={checkoutForm.paymentMethod === "cod"}
                                            />
                                            {checkoutErrors.transactionId && <small>{checkoutErrors.transactionId}</small>}
                                        </div>
                                    </div>

                                    {checkoutErrors.checkout && <p className="checkout-error">{checkoutErrors.checkout}</p>}

                                    <div className="checkout-actions">
                                        <button type="button" className="place-order-btn" onClick={placeOrder} disabled={placingOrder}>
                                            {placingOrder ? "Placing Order…" : "Place Order →"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default Cart;
