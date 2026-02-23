import jwt from "jsonwebtoken";
import { Usermodel } from "../models/Usermodel.js";

const verifyToken = async (req, res, next) => {
    try {
        // Support both "Bearer <token>" header and cookie
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.startsWith("Bearer "))
            ? authHeader.split(" ")[1]
            : req.cookies?.accessToken;

        if (!token) {
            return res.status(401).send({
                message: "Access token is required",
                status: "unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await Usermodel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).send({
                message: "Invalid token — user not found",
                status: "unauthorized"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({
            message: "Token expired or invalid",
            status: "unauthorized"
        });
    }
};

export { verifyToken };
