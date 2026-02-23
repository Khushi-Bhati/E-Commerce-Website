import express from "express";
import { getSellerAnalyticsController } from "../controllers/analyticscontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const analyticsrouter = express.Router();

analyticsrouter.get("/seller/:sellerId", verifyToken, getSellerAnalyticsController);

export default analyticsrouter;
