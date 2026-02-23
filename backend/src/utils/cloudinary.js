import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// UPLOAD ON CLOUDINARY 

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto'
        })

        console.log("File successfully uploaded", response.url);

        fs.unlinkSync(localfilepath)

        return response;

    } catch (error) {
        console.log("image not upload successfully",error)
        fs.unlinkSync(localfilepath)
        return null


    }
}


export { uploadOnCloudinary }





