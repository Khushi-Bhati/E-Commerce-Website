import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/db.js";
import { app } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../.env")
})


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8001, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        });




    })
    .catch((error) => {
        console.log("MONGODB DB CONNECTION FAILED", error);

    })



