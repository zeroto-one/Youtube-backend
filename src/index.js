 import mongoose, { connect } from "mongoose";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./env"
});

 ConnectDB().then(()=>{//connectDB is async it returns a promise so we should do this we resolve promise like this ..
    console.log("Db Connected");
    app.listen(process.env.PORT||3000,()=>{//*step one is connected to db then we start listing at our port .
        console.log(`APP is listing bhai at PORT :${process.env.PORT}`);
    })
 }).catch((err)=>{
    console.log("Db connect krne me error hen bhai ye catch wala hen ",err);
 });
 /**import {DB_NAME} from "./constants.js";
 import express from "express";
 const app =express();
/** this is very good way but professionally we don't do it like this ok 
;(async ()=>{//this is call iifes these are (()=>{})() now this ill execute immediately 
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERRRRR express is not able to talk with DB ",error);
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`our app is listing at port :${process.env.PORT}` );
        })
    }
    catch(error){
        console.error("Error: ",error);
        throw error
    }
})();*/