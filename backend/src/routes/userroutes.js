import express from "express";
import {
    logincontroller,
    logoutcontroller,
    registercontroller,
    forgotPasswordController,
    resetPasswordController
} from "../controllers/usercontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const userrouter = express.Router();

// Public routes
userrouter.post("/register", registercontroller);
userrouter.post("/login", logincontroller);
userrouter.post("/forgot-password", forgotPasswordController);
userrouter.post("/reset-password", resetPasswordController);

// Protected routes
userrouter.post("/logout", verifyToken, logoutcontroller);

export default userrouter;
