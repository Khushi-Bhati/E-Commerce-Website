import mongoose from "mongoose";




// const Addresschema=mongoose.Schema(
//     {
      
//             type:String,
//             required:true
        
//     }
// )


const Buyerschema=new mongoose.Schema(
    {

         name:{
            type:String,
            required:true,
         },

         mobileno:{
            type:String,
            require:true,
            unique:true,
         },

         profileimg:{
            type:String,
            required:true

         },

         shippingaddress:[
            {
               type:String,
               required:true,
            }
         ],


         userID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true,
         }





         

    },
    {
       timestamps: true
    }
)


export const Buyermoddel=mongoose.model("customer",Buyerschema);
