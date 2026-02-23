import express from "express";
import {
    addToCartController,
    clearCartController,
    getCartController,
    removeCartItemController,
    updateCartItemController
} from "../controllers/cartcontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const cartrouter = express.Router();

cartrouter.post("/add", verifyToken, addToCartController);
cartrouter.get("/get/:userId", verifyToken, getCartController);
cartrouter.put("/update/:userId/:productId", verifyToken, updateCartItemController);
cartrouter.delete("/remove/:userId/:productId", verifyToken, removeCartItemController);
cartrouter.delete("/clear/:userId", verifyToken, clearCartController);

export default cartrouter;
