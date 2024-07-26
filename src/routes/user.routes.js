import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";//always use .js at the end

//now use this Router


export const router =Router();
//now use this Router when /user pe call ani control idr aa jana then /user/register pe post req ani then re registerUser function call ho jana
router.route("/register").post(registerUser);//explain

//other routes will be added here.
