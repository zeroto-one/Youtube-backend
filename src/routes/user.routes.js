import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDetails,
} from "../controllers/user.controller.js"; //always use .js at the end
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; //this

export const router = Router();

//now use this Router when /user pe call ani control idr aa jana then /user/register pe post req ani then re registerUser function call ho jana
router.route("/register").post(
    upload.fields(
        // * here we wrote middleware to handle our files
        //  you can add multiple files here like this {name:"file1", maxCount:1}, {name:"file2", maxCount:1} etc
        [
            {
                name: "avatar",
                maxCount: 1,
            },
            {
                name: "coverImage",
                maxCount: 1,
            },
        ] // this filed is a array  of files which we want to upload
    ),
    registerUser
); //explain

router.route("/login").post(loginUser);
//login ke bad wale routes AKA secure Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateUserDetails);
router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
    .route("/update-cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
