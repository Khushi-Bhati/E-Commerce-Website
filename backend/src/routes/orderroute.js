import express from "express";
import {
    createOrderController,
    getBuyerOrdersController,
    getSellerOrdersController,
    updateOrderStatusController
} from "../controllers/ordercontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const orderrouter = express.Router();

orderrouter.post("/create", verifyToken, createOrderController);
orderrouter.get("/buyer/:buyerId", verifyToken, getBuyerOrdersController);
orderrouter.get("/seller/:sellerId", verifyToken, getSellerOrdersController);
orderrouter.put("/status/:orderId", verifyToken, updateOrderStatusController);

export default orderrouter;
