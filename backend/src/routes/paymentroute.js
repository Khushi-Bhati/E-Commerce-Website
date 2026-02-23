import express from "express";
import {
    createPaymentController,
    getSellerPaymentsController,
    updatePaymentStatusController
} from "../controllers/paymentcontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const paymentrouter = express.Router();

paymentrouter.post("/create", verifyToken, createPaymentController);
paymentrouter.get("/seller/:sellerId", verifyToken, getSellerPaymentsController);
paymentrouter.put("/status/:paymentId", verifyToken, updatePaymentStatusController);

export default paymentrouter;
