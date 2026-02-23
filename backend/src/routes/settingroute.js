import express from "express";
import {
    getSellerSettingsController,
    updateSellerSettingsController
} from "../controllers/settingcontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const settingrouter = express.Router();

settingrouter.get("/:sellerId", verifyToken, getSellerSettingsController);
settingrouter.put("/:sellerId", verifyToken, updateSellerSettingsController);

export default settingrouter;
