import express from "express";
import {
    createPaymentController,
    getSellerPaymentsController,
    updatePaymentStatusController,
    createStripeSession,
    verifyStripeSession
} from "../controllers/paymentcontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const paymentrouter = express.Router();

paymentrouter.post("/create", verifyToken, createPaymentController);
paymentrouter.post("/stripe/create-session", verifyToken, createStripeSession);
paymentrouter.post("/stripe/verify", verifyToken, verifyStripeSession);
paymentrouter.get("/seller/:sellerId", verifyToken, getSellerPaymentsController);
paymentrouter.put("/status/:paymentId", verifyToken, updatePaymentStatusController);

export default paymentrouter;
