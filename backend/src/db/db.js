import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";






const connectDB = async() => {
  try {

    // const connectionInstances=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    // console.log(`MONGODB CONNECT !! DB HOST: ${connectionInstances.connection.host}`);

    const connectionInstances = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

    console.log(`MONGODB CONNECT !! DB HOST: ${connectionInstances.connection.host}`);


  } catch (error) {
    console.log("Mongodb connection error", error)
    process.exit(1)


  }

}




export default connectDB;

