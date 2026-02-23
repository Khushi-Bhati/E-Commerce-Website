import express from "express";
import {
    addproductcontroller,
    deleteproductcontroller,
    getproductscontroller,
    getProductByIdController,
    updateproductcontroller
} from "../controllers/productcontroller.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const productrouter = express.Router();

// Public routes
productrouter.get("/getproducts", getproductscontroller);
productrouter.get("/getproduct/:id", getProductByIdController);

// Protected routes (require login)
productrouter.post("/addproduct", verifyToken, upload.fields([{ name: "productimg", maxCount: 4 }]), addproductcontroller);
productrouter.put("/updateproduct/:id", verifyToken, upload.fields([{ name: "productimg", maxCount: 4 }]), updateproductcontroller);
productrouter.delete("/deleteproduct/:id", verifyToken, deleteproductcontroller);

export default productrouter;
