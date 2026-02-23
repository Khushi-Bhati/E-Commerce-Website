import express from "express";
import { buyerprofilecontroller, updatebuyerprofilecontroller, getbuyerprofilecontroller } from "../controllers/buyercontroller.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const buyerrouter = express.Router();

buyerrouter.post("/profile", verifyToken, upload.fields([{ name: "profileimg", maxCount: 1 }]), buyerprofilecontroller);
buyerrouter.put("/profile", verifyToken, upload.fields([{ name: "profileimg", maxCount: 1 }]), updatebuyerprofilecontroller);
buyerrouter.get("/getprofile/:id", verifyToken, getbuyerprofilecontroller);

export default buyerrouter;