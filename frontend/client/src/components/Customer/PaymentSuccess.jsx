import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../../config/api.js";
import Header from "./Header";
import Footer from "./Footer";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

  .ps-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    display: flex;
    flex-direction: column;
    font-family: 'Inter', sans-serif;
  }
  .ps-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }
  .ps-card {
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 28px;
    padding: 52px 48px;
    text-align: center;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 24px 64px rgba(0,0,0,0.35);
    animation: psSlideUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
  }
  @keyframes psSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ps-icon-wrap {
    width: 88px; height: 88px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    font-size: 40px;
    animation: psIconPop 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes psIconPop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .ps-icon-wrap.success { background: rgba(16,185,129,0.15); border: 2px solid rgba(16,185,129,0.4); }
  .ps-icon-wrap.failed  { background: rgba(239,68,68,0.15);  border: 2px solid rgba(239,68,68,0.4);  }
  .ps-icon-wrap.loading { background: rgba(99,102,241,0.15); border: 2px solid rgba(99,102,241,0.4); }

  .ps-spinner {
    width: 40px; height: 40px;
    border: 4px solid rgba(255,255,255,0.15);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: psSpin 0.9s linear infinite;
  }
  @keyframes psSpin { to { transform: rotate(360deg); } }

  .ps-title {
    font-size: 28px; font-weight: 900;
    margin: 0 0 10px;
    letter-spacing: -0.4px;
  }
  .ps-title.success { color: #34d399; }
  .ps-title.failed  { color: #f87171; }
  .ps-title.loading { color: #a5b4fc; }

  .ps-msg {
    font-size: 15px; color: rgba(255,255,255,0.65);
    line-height: 1.6; margin: 0 0 32px;
  }

  .ps-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px;
    border-radius: 14px;
    font-size: 15px; font-weight: 700; font-family: 'Inter',sans-serif;
    text-decoration: none;
    border: none; cursor: pointer;
    transition: transform 200ms ease, box-shadow 200ms ease;
  }
  .ps-btn:hover { transform: translateY(-2px); }
  .ps-btn.primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  }
  .ps-btn.primary:hover { box-shadow: 0 12px 32px rgba(99,102,241,0.55); }
  .ps-btn.secondary {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .ps-btn.secondary:hover { background: rgba(255,255,255,0.14); }

  .ps-confetti {
    position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 9999;
  }
  .ps-confetti-dot {
    position: absolute;
    top: -20px;
    border-radius: 50%;
    animation: psFall linear forwards;
  }
  @keyframes psFall {
    to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
`;

const Confetti = () => {
    const dots = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${6 + Math.random() * 10}px`,
        color: ["#6366f1", "#8b5cf6", "#34d399", "#f59e0b", "#f87171", "#a5b4fc"][Math.floor(Math.random() * 6)],
        duration: `${1.5 + Math.random() * 2}s`,
        delay: `${Math.random() * 1}s`,
    }));

    return (
        <div className="ps-confetti">
            {dots.map((d) => (
                <div
                    key={d.id}
                    className="ps-confetti-dot"
                    style={{
                        left: d.left,
                        width: d.size,
                        height: d.size,
                        background: d.color,
                        animationDuration: d.duration,
                        animationDelay: d.delay,
                    }}
                />
            ))}
        </div>
    );
};

const PaymentSuccess = () => {
    const [status, setStatus] = useState("verifying");
    const [statusMessage, setStatusMessage] = useState("Verifying your payment, please wait…");
    const [showConfetti, setShowConfetti] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const sessionId = params.get("session_id");

                if (!sessionId) {
                    setStatus("failed");
                    setStatusMessage("No session ID found. Please contact support if you were charged.");
                    return;
                }

                const verifyRes = await API.post("/payment/stripe/verify", { session_id: sessionId });

                if (verifyRes.data.status === "success" && verifyRes.data.payment_status === "paid") {
                    const storedDetails = localStorage.getItem("pendingStripePayment");
                    if (storedDetails) {
                        try {
                            const parsedPayment = JSON.parse(storedDetails);
                            const paymentDetailsList = Array.isArray(parsedPayment)
                                ? parsedPayment
                                : (Array.isArray(parsedPayment?.paymentDetails) ? parsedPayment.paymentDetails : []);
                            const selectedMethod = Array.isArray(parsedPayment)
                                ? "card"
                                : (parsedPayment?.method || "card");
                            const normalizedMethod = ["card", "upi", "netbanking", "wallet"].includes(selectedMethod)
                                ? selectedMethod
                                : "card";

                            for (const details of paymentDetailsList) {
                                await API.post("/payment/create", {
                                    ...details,
                                    method: normalizedMethod,
                                    transactionId: sessionId,
                                });
                            }

                            const userId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();
                            if (userId) await API.delete(`/cart/clear/${userId}`);

                            localStorage.removeItem("pendingStripePayment");
                            setStatus("success");
                            setStatusMessage("Your payment was successful and your order has been confirmed!");
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 3500);
                        } catch (err) {
                            console.error("Failed to process payment models", err);
                            setStatus("failed");
                            setStatusMessage("Payment was received, but we had trouble linking it to your order. Please contact support with your session ID.");
                        }
                    } else {
                        setStatus("success");
                        setStatusMessage("Payment verified successfully!");
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 3500);
                    }
                } else {
                    setStatus("failed");
                    setStatusMessage("Payment verification failed or the payment was not completed.");
                }
            } catch (error) {
                console.error("verify error", error);
                setStatus("failed");
                setStatusMessage("An error occurred while verifying your payment.");
            }
        };

        verifyPayment();
    }, [location.search]);

    return (
        <>
            <style>{styles}</style>
            {showConfetti && <Confetti />}

            <div className="ps-page">
                <Header cartCount={0} />

                <main className="ps-main">
                    <div className="ps-card">

                        {/* Icon */}
                        <div className={`ps-icon-wrap ${status}`}>
                            {status === "verifying" && <div className="ps-spinner" />}
                            {status === "success" && <span>✅</span>}
                            {status === "failed" && <span>❌</span>}
                        </div>

                        {/* Title */}
                        <h1 className={`ps-title ${status}`}>
                            {status === "verifying" && "Processing Payment…"}
                            {status === "success" && "Payment Successful!"}
                            {status === "failed" && "Payment Failed"}
                        </h1>

                        {/* Message */}
                        <p className="ps-msg">{statusMessage}</p>

                        {/* Actions */}
                        {status === "success" && (
                            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                <Link to="/customer/home" className="ps-btn primary">
                                    🛍️ Continue Shopping
                                </Link>
                            </div>
                        )}

                        {status === "failed" && (
                            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                <Link to="/customer/cart" className="ps-btn secondary">
                                    ← Return to Cart
                                </Link>
                                <Link to="/customer/home" className="ps-btn primary">
                                    🏠 Go Home
                                </Link>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default PaymentSuccess;
