import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";//user ke cookie pe crud operation kr paye


export const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN ,
    credentials:true,
}))
// * middleware ka use wo checking before access the server 
//req res and next() middleware one apna kaam krega and next ( ) ko bej dega 
//middleware for json wala data
app.use(express.json({limit:"16kb"}));//limit krna imp hen 
app.use(express.urlencoded({extended:true,limit:"16kb"}))//url ko encode krne ke liye hen ye 
app.use(express.static("public"))// public assess hote hen koi bhi ake use kr lete hen
app.use(cookieParser());//browser ke 
