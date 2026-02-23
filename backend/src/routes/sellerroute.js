import { getsellercustomerscontroller, getsellerprofilecontroller, sellerprofilecontroller } from "../controllers/sellercontroller.js";
import express from "express";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const sellerrouter = express.Router();

sellerrouter.post("/sellerprofile", verifyToken, upload.fields([{ name: "profileimg", maxCount: 1 }]), sellerprofilecontroller);
sellerrouter.get("/getprofile/:id", verifyToken, getsellerprofilecontroller);
sellerrouter.get("/customers/:sellerId", verifyToken, getsellercustomerscontroller);

export default sellerrouter;
