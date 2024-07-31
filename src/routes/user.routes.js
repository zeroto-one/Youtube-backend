import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";//always use .js at the end
import {upload} from "../middlewares/multer.middleware.js"
//now use this Router


export const router =Router();
//now use this Router when /user pe call ani control idr aa jana then /user/register pe post req ani then re registerUser function call ho jana
router.route("/register").post(
    upload.fields(// * here we wrote middleware to handle our files 
//  you can add multiple files here like this {name:"file1", maxCount:1}, {name:"file2", maxCount:1} etc
        [{
            name:"avatar" ,
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }]// this filed is a array  of files which we want to upload
    )
    ,registerUser);//explain

//other routes will be added here.
