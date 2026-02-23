import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser"
import userrouter from "./routes/userroutes.js";
import buyerrouter from "./routes/buyerroute.js";
import sellerrouter from "./routes/sellerroute.js";
import productrouter from "./routes/productroute.js";
import cartrouter from "./routes/cartroute.js";
import orderrouter from "./routes/orderroute.js";
import paymentrouter from "./routes/paymentroute.js";
import reviewrouter from "./routes/reviewroute.js";
import settingrouter from "./routes/settingroute.js";
import analyticsrouter from "./routes/analyticsroute.js";
const app=express();



app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(cookieparser());


app.use("/Easeincart/user",userrouter)
app.use("/Easeincart/customer",buyerrouter)
app.use("/Easeincart/seller",sellerrouter)
app.use("/Easeincart/product",productrouter)
app.use("/Easeincart/cart",cartrouter)
app.use("/Easeincart/order", orderrouter)
app.use("/Easeincart/payment", paymentrouter)
app.use("/Easeincart/review", reviewrouter)
app.use("/Easeincart/setting", settingrouter)
app.use("/Easeincart/analytics", analyticsrouter)


// http://localhost:8000/Easeincart/user/login



export {app}
